using System.Text.Json;
using CartService.DTOs.Requests;
using CartService.DTOs.Responses;
using CartService.Models;
using CartService.Repositories.Interfaces;
using CartService.Services.Interfaces;
using Microsoft.Extensions.Caching.Distributed;

namespace CartService.Services.Implementations;

/// <summary>
/// Implementation du service panier.
/// SOLID - S : chaque methode a une seule responsabilite.
/// SOLID - D : depend des interfaces ICartRepository et IDistributedCache.
///
/// Architecture Redis :
/// - Le panier est stocke en SQL Server (persistance)
/// - Le panier est aussi cache dans Redis (performance)
/// - Redis = acces ultra-rapide sans requete SQL a chaque page
/// </summary>
public class CartServiceImpl : ICartService
{
    private readonly ICartRepository _cartRepository;
    private readonly IDistributedCache _cache;
    private readonly HttpClient _httpClient;
    private readonly IConfiguration _configuration;
    private readonly ILogger<CartServiceImpl> _logger;

    private const string CART_CACHE_PREFIX = "cart:";
    private readonly TimeSpan CACHE_EXPIRY = TimeSpan.FromMinutes(30);

    public CartServiceImpl(
        ICartRepository cartRepository,
        IDistributedCache cache,
        IHttpClientFactory httpClientFactory,
        IConfiguration configuration,
        ILogger<CartServiceImpl> logger)
    {
        _cartRepository = cartRepository;
        _cache = cache;
        _httpClient = httpClientFactory.CreateClient();
        _configuration = configuration;
        _logger = logger;
    }

    public async Task<ApiResponse<CartResponse>> GetCartAsync(string userId)
    {
        // 1. Essayer le cache Redis d abord
        var cached = await GetFromCacheAsync(userId);
        if (cached != null)
        {
            _logger.LogInformation("Panier recupere depuis Redis pour {UserId}", userId);
            return ApiResponse<CartResponse>.SuccessResponse("Panier recupere (cache)", cached);
        }

        // 2. Si pas dans Redis, aller en SQL Server
        var cart = await _cartRepository.GetCartWithItemsByUserIdAsync(userId);
        if (cart == null)
        {
            var emptyCart = new CartResponse { UserId = userId, Items = new() };
            return ApiResponse<CartResponse>.SuccessResponse("Panier vide", emptyCart);
        }

        var response = MapToResponse(cart);
        await SetInCacheAsync(userId, response);
        return ApiResponse<CartResponse>.SuccessResponse("Panier recupere", response);
    }

    public async Task<ApiResponse<CartResponse>> AddToCartAsync(string userId, AddToCartRequest request)
    {
        _logger.LogInformation("Ajout produit {ProductId} au panier de {UserId}", request.ProductId, userId);

        // 1. Verifier que le produit existe dans CatalogService
        var productInfo = await GetProductInfoAsync(request.ProductId);
        if (productInfo == null)
            return ApiResponse<CartResponse>.ErrorResponse("Produit introuvable dans le catalogue");

        // 2. Verifier le stock dans InventoryService
        var isAvailable = await CheckStockAsync(request.ProductId, request.Quantity);
        if (!isAvailable)
            return ApiResponse<CartResponse>.ErrorResponse("Stock insuffisant pour ce produit");

        // 3. Recuperer ou creer le panier
        var cart = await _cartRepository.GetCartWithItemsByUserIdAsync(userId)
                   ?? await _cartRepository.CreateCartAsync(userId);

        // 4. Ajouter ou mettre a jour l article
        var existingItem = await _cartRepository.GetCartItemAsync(cart.Id, request.ProductId);
        if (existingItem != null)
        {
            existingItem.Quantity += request.Quantity;
            await _cartRepository.UpdateCartItemAsync(existingItem);
        }
        else
        {
            var newItem = new CartItem
            {
                CartId = cart.Id,
                ProductId = request.ProductId,
                Quantity = request.Quantity,
                Price = productInfo.Price,
                ProductTitle = productInfo.Title,
                ProductImageUrl = productInfo.ImageUrl
            };
            await _cartRepository.AddCartItemAsync(newItem);
        }

        // 5. Recharger et mettre en cache
        cart = await _cartRepository.GetCartWithItemsByUserIdAsync(userId);
        var response = MapToResponse(cart!);
        await SetInCacheAsync(userId, response);

        return ApiResponse<CartResponse>.SuccessResponse("Produit ajoute au panier", response);
    }

    public async Task<ApiResponse<CartResponse>> UpdateCartItemAsync(string userId, int itemId, UpdateCartItemRequest request)
    {
        var cart = await _cartRepository.GetCartWithItemsByUserIdAsync(userId);
        if (cart == null)
            return ApiResponse<CartResponse>.ErrorResponse("Panier introuvable");

        var item = cart.Items.FirstOrDefault(i => i.Id == itemId);
        if (item == null)
            return ApiResponse<CartResponse>.ErrorResponse("Article introuvable dans le panier");

        // Verifier le stock pour la nouvelle quantite
        var isAvailable = await CheckStockAsync(item.ProductId, request.Quantity);
        if (!isAvailable)
            return ApiResponse<CartResponse>.ErrorResponse("Stock insuffisant");

        item.Quantity = request.Quantity;
        await _cartRepository.UpdateCartItemAsync(item);

        cart = await _cartRepository.GetCartWithItemsByUserIdAsync(userId);
        var response = MapToResponse(cart!);
        await SetInCacheAsync(userId, response);

        return ApiResponse<CartResponse>.SuccessResponse("Panier mis a jour", response);
    }

    public async Task<ApiResponse<bool>> RemoveFromCartAsync(string userId, int itemId)
    {
        var cart = await _cartRepository.GetCartWithItemsByUserIdAsync(userId);
        if (cart == null)
            return ApiResponse<bool>.ErrorResponse("Panier introuvable");

        var item = cart.Items.FirstOrDefault(i => i.Id == itemId);
        if (item == null)
            return ApiResponse<bool>.ErrorResponse("Article introuvable");

        await _cartRepository.DeleteCartItemAsync(itemId);
        await InvalidateCacheAsync(userId);

        return ApiResponse<bool>.SuccessResponse("Article supprime du panier", true);
    }

    public async Task<ApiResponse<bool>> ClearCartAsync(string userId)
    {
        await _cartRepository.ClearCartAsync(userId);
        await InvalidateCacheAsync(userId);
        return ApiResponse<bool>.SuccessResponse("Panier vide", true);
    }

    public async Task<ApiResponse<CartResponse>> GetCartForOrderAsync(string userId)
    {
        var cart = await _cartRepository.GetCartWithItemsByUserIdAsync(userId);
        if (cart == null || !cart.Items.Any())
            return ApiResponse<CartResponse>.ErrorResponse("Panier vide — impossible de passer commande");

        return ApiResponse<CartResponse>.SuccessResponse("Panier pour commande", MapToResponse(cart));
    }

    // ── Methodes privees ────────────────────────────────────────

    private async Task<ProductInfo?> GetProductInfoAsync(string productId)
    {
        try
        {
            var catalogUrl = _configuration["Services:CatalogServiceUrl"];
            var response = await _httpClient.GetAsync($"{catalogUrl}/api/catalog/products/{productId}");
            if (!response.IsSuccessStatusCode) return null;

            var content = await response.Content.ReadAsStringAsync();
            var result = JsonSerializer.Deserialize<CatalogApiResponse>(content,
                new JsonSerializerOptions { PropertyNameCaseInsensitive = true });

            if (result?.Success == true && result.Data != null)
                return result.Data;

            return null;
        }
        catch (Exception ex)
        {
            _logger.LogWarning("CatalogService indisponible : {Message}", ex.Message);
            return null;
        }
    }

    private async Task<bool> CheckStockAsync(string productId, int quantity)
    {
        try
        {
            var inventoryUrl = _configuration["Services:InventoryServiceUrl"];
            var response = await _httpClient.GetAsync(
                $"{inventoryUrl}/api/inventory/product/{productId}/available?quantity={quantity}");

            if (!response.IsSuccessStatusCode) return true; // Si indisponible, on laisse passer

            var content = await response.Content.ReadAsStringAsync();
            var result = JsonSerializer.Deserialize<InventoryApiResponse>(content,
                new JsonSerializerOptions { PropertyNameCaseInsensitive = true });

            return result?.Data ?? true;
        }
        catch (Exception ex)
        {
            _logger.LogWarning("InventoryService indisponible : {Message}", ex.Message);
            return true;
        }
    }

    private CartResponse MapToResponse(Cart cart)
    {
        var items = cart.Items.Select(i => new CartItemResponse
        {
            Id = i.Id,
            ProductId = i.ProductId,
            ProductTitle = i.ProductTitle,
            ProductImageUrl = i.ProductImageUrl,
            Quantity = i.Quantity,
            Price = i.Price,
            Subtotal = i.Price * i.Quantity
        }).ToList();

        return new CartResponse
        {
            Id = cart.Id,
            UserId = cart.UserId,
            Items = items,
            TotalAmount = items.Sum(i => i.Subtotal),
            TotalItems = items.Sum(i => i.Quantity),
            UpdatedAt = cart.UpdatedAt
        };
    }

    // ── Redis Cache ─────────────────────────────────────────────
    private async Task<CartResponse?> GetFromCacheAsync(string userId)
    {
        try
        {
            var cached = await _cache.GetStringAsync(CART_CACHE_PREFIX + userId);
            if (cached == null) return null;
            return JsonSerializer.Deserialize<CartResponse>(cached);
        }
        catch { return null; }
    }

    private async Task SetInCacheAsync(string userId, CartResponse cart)
    {
        try
        {
            var options = new DistributedCacheEntryOptions
            {
                AbsoluteExpirationRelativeToNow = CACHE_EXPIRY
            };
            await _cache.SetStringAsync(CART_CACHE_PREFIX + userId,
                JsonSerializer.Serialize(cart), options);
        }
        catch (Exception ex)
        {
            _logger.LogWarning("Impossible de mettre en cache Redis : {Message}", ex.Message);
        }
    }

    private async Task InvalidateCacheAsync(string userId)
    {
        try { await _cache.RemoveAsync(CART_CACHE_PREFIX + userId); }
        catch { }
    }

    // ── Classes internes pour deserialisation ───────────────────
    private class CatalogApiResponse
    {
        public bool Success { get; set; }
        public ProductInfo? Data { get; set; }
    }

    private class InventoryApiResponse
    {
        public bool Success { get; set; }
        public bool Data { get; set; }
    }
}

public class ProductInfo
{
    public string Id { get; set; } = string.Empty;
    public string Title { get; set; } = string.Empty;
    public decimal Price { get; set; }
    public string? ImageUrl { get; set; }
}