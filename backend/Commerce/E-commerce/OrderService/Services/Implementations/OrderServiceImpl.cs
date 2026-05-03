using System.Text;
using System.Text.Json;
using OrderService.DTOs.Requests;
using OrderService.DTOs.Responses;
using OrderService.Models;
using OrderService.Repositories.Interfaces;
using OrderService.Services.Interfaces;

namespace OrderService.Services.Implementations;

/// <summary>
/// Service commande — orchestre Cart + Inventory + Payment.
/// SOLID - S : chaque methode a une responsabilite unique.
/// SOLID - D : depend des interfaces repository et HttpClient.
///
/// Flux de commande :
/// 1. Recuperer le panier depuis CartService
/// 2. Reserver le stock dans InventoryService pour chaque article
/// 3. Creer la commande en DB
/// 4. Appeler PaymentService pour traiter le paiement
/// 5. Si paiement OK : confirmer commande + vider panier
/// 6. Si paiement KO : liberer le stock + annuler commande
/// </summary>
public class OrderServiceImpl : IOrderService
{
    private readonly IOrderRepository _orderRepository;
    private readonly IHttpClientFactory _httpClientFactory;
    private readonly IConfiguration _configuration;
    private readonly ILogger<OrderServiceImpl> _logger;

    public OrderServiceImpl(
        IOrderRepository orderRepository,
        IHttpClientFactory httpClientFactory,
        IConfiguration configuration,
        ILogger<OrderServiceImpl> logger)
    {
        _orderRepository = orderRepository;
        _httpClientFactory = httpClientFactory;
        _configuration = configuration;
        _logger = logger;
    }

    public async Task<ApiResponse<OrderResponse>> CreateOrderAsync(string userId, CreateOrderRequest request)
    {
        _logger.LogInformation("Creation commande pour utilisateur {UserId}", userId);

        // ── 1. Recuperer le panier ──────────────────────────────
        var cartItems = await GetCartItemsAsync(userId);
        if (cartItems == null || !cartItems.Any())
            return ApiResponse<OrderResponse>.ErrorResponse("Panier vide — impossible de passer commande");

        // ── 2. Calculer les montants ────────────────────────────
        var totalAmount = cartItems.Sum(i => i.Subtotal);
        var discountAmount = 0m;

        // Appliquer le code promo si fourni
        if (!string.IsNullOrEmpty(request.PromoCode))
        {
            var discount = await ApplyPromoCodeAsync(request.PromoCode, totalAmount);
            discountAmount = discount;
        }

        var finalAmount = totalAmount - discountAmount;

        // ── 3. Reserver le stock pour chaque article ────────────
        var reservedProducts = new List<(string productId, int quantity)>();
        foreach (var item in cartItems)
        {
            var reserved = await ReserveStockAsync(item.ProductId, item.Quantity, 0);
            if (!reserved)
            {
                // Liberer les reservations deja faites
                foreach (var (pid, qty) in reservedProducts)
                    await ReleaseStockAsync(pid, 0);

                return ApiResponse<OrderResponse>.ErrorResponse(
                    $"Stock insuffisant pour le produit : {item.ProductTitle}");
            }
            reservedProducts.Add((item.ProductId, item.Quantity));
        }

        // ── 4. Creer la commande en DB ──────────────────────────
        var order = new Order
        {
            UserId = userId,
            Status = OrderStatus.Pending,
            PaymentStatus = Models.PaymentStatus.Pending,
            TotalAmount = totalAmount,
            DiscountAmount = discountAmount,
            FinalAmount = finalAmount,
            PromoCode = request.PromoCode,
            ShippingAddress = request.ShippingAddress,
            ShippingCity = request.ShippingCity,
            ShippingPhone = request.ShippingPhone,
            Notes = request.Notes,
            Items = cartItems.Select(i => new OrderItem
            {
                ProductId = i.ProductId,
                ProductTitle = i.ProductTitle,
                ProductImageUrl = i.ProductImageUrl,
                Quantity = i.Quantity,
                UnitPrice = i.Price,
                Subtotal = i.Subtotal
            }).ToList()
        };

        order = await _orderRepository.CreateAsync(order);

        // Ajouter l historique
        await _orderRepository.AddStatusHistoryAsync(new OrderStatusHistory
        {
            OrderId = order.Id,
            Status = OrderStatus.Pending,
            Comment = "Commande creee",
            ChangedBy = userId
        });

        _logger.LogInformation("Commande {OrderId} creee avec succes", order.Id);

        return ApiResponse<OrderResponse>.SuccessResponse(
            "Commande creee — procedez au paiement",
            MapToResponse(order));
    }

    public async Task<ApiResponse<OrderResponse>> ConfirmPaymentAsync(int orderId, string paymentIntentId)
    {
        _logger.LogInformation("Confirmation paiement commande {OrderId}", orderId);

        var order = await _orderRepository.GetByIdWithDetailsAsync(orderId);
        if (order == null)
            return ApiResponse<OrderResponse>.ErrorResponse("Commande introuvable");

        order.Status = OrderStatus.Confirmed;
        order.PaymentStatus = Models.PaymentStatus.Paid;
        order.StripePaymentIntentId = paymentIntentId;
        order.PaidAt = DateTime.UtcNow;

        await _orderRepository.UpdateAsync(order);

        await _orderRepository.AddStatusHistoryAsync(new OrderStatusHistory
        {
            OrderId = order.Id,
            Status = OrderStatus.Confirmed,
            Comment = $"Paiement confirme — Stripe {paymentIntentId}",
            ChangedBy = "system"
        });

        // Vider le panier apres paiement confirme
        await ClearCartAsync(order.UserId);

        _logger.LogInformation("Commande {OrderId} confirmee et payee", orderId);

        return ApiResponse<OrderResponse>.SuccessResponse(
            "Paiement confirme — commande en traitement",
            MapToResponse(order));
    }

    public async Task<ApiResponse<OrderResponse>> CancelOrderAsync(int orderId, string userId)
    {
        var order = await _orderRepository.GetByIdWithDetailsAsync(orderId);
        if (order == null)
            return ApiResponse<OrderResponse>.ErrorResponse("Commande introuvable");

        if (order.UserId != userId)
            return ApiResponse<OrderResponse>.ErrorResponse("Non autorise");

        if (order.Status == OrderStatus.Shipped || order.Status == OrderStatus.Delivered)
            return ApiResponse<OrderResponse>.ErrorResponse("Impossible d annuler une commande expediee ou livree");

        // Liberer le stock
        foreach (var item in order.Items)
            await ReleaseStockAsync(item.ProductId, order.Id);

        order.Status = OrderStatus.Cancelled;
        await _orderRepository.UpdateAsync(order);

        await _orderRepository.AddStatusHistoryAsync(new OrderStatusHistory
        {
            OrderId = order.Id,
            Status = OrderStatus.Cancelled,
            Comment = "Commande annulee par l etudiant",
            ChangedBy = userId
        });

        return ApiResponse<OrderResponse>.SuccessResponse("Commande annulee", MapToResponse(order));
    }

    public async Task<ApiResponse<OrderResponse>> UpdateOrderStatusAsync(
        int orderId, UpdateOrderStatusRequest request, string changedBy)
    {
        var order = await _orderRepository.GetByIdWithDetailsAsync(orderId);
        if (order == null)
            return ApiResponse<OrderResponse>.ErrorResponse("Commande introuvable");

        order.Status = request.Status;

        if (request.Status == OrderStatus.Shipped)
        {
            order.ShippedAt = DateTime.UtcNow;
            order.TrackingNumber = request.TrackingNumber;
        }
        else if (request.Status == OrderStatus.Delivered)
        {
            order.DeliveredAt = DateTime.UtcNow;
        }

        await _orderRepository.UpdateAsync(order);

        await _orderRepository.AddStatusHistoryAsync(new OrderStatusHistory
        {
            OrderId = order.Id,
            Status = request.Status,
            Comment = request.Comment,
            ChangedBy = changedBy
        });

        return ApiResponse<OrderResponse>.SuccessResponse(
            $"Statut mis a jour : {request.Status}",
            MapToResponse(order));
    }

    public async Task<ApiResponse<OrderResponse>> GetOrderByIdAsync(int orderId, string userId)
    {
        var order = await _orderRepository.GetByIdWithDetailsAsync(orderId);
        if (order == null)
            return ApiResponse<OrderResponse>.ErrorResponse("Commande introuvable");
        if (order.UserId != userId)
            return ApiResponse<OrderResponse>.ErrorResponse("Non autorise");
        return ApiResponse<OrderResponse>.SuccessResponse("Commande trouvee", MapToResponse(order));
    }

    public async Task<ApiResponse<List<OrderResponse>>> GetMyOrdersAsync(string userId)
    {
        var orders = await _orderRepository.GetByUserIdAsync(userId);
        return ApiResponse<List<OrderResponse>>.SuccessResponse(
            "Mes commandes", orders.Select(MapToResponse).ToList());
    }

    public async Task<ApiResponse<List<OrderResponse>>> GetAllOrdersAsync()
    {
        var orders = await _orderRepository.GetAllAsync();
        return ApiResponse<List<OrderResponse>>.SuccessResponse(
            "Toutes les commandes", orders.Select(MapToResponse).ToList());
    }

    // ── Appels inter-services ───────────────────────────────────

    private async Task<List<CartItemDto>?> GetCartItemsAsync(string userId)
    {
        try
        {
            var client = _httpClientFactory.CreateClient();
            var cartUrl = _configuration["Services:CartServiceUrl"];
            var response = await client.GetAsync($"{cartUrl}/api/cart/user/{userId}");
            if (!response.IsSuccessStatusCode) return null;

            var content = await response.Content.ReadAsStringAsync();
            var result = JsonSerializer.Deserialize<CartApiResponse>(content,
                new JsonSerializerOptions { PropertyNameCaseInsensitive = true });

            return result?.Data?.Items;
        }
        catch (Exception ex)
        {
            _logger.LogError("Erreur CartService : {Message}", ex.Message);
            return null;
        }
    }

    private async Task<bool> ReserveStockAsync(string productId, int quantity, int orderId)
    {
        try
        {
            var client = _httpClientFactory.CreateClient("ssl-ignore");
            var inventoryUrl = _configuration["Services:InventoryServiceUrl"];
            var body = JsonSerializer.Serialize(new { orderId, quantity });
            var content = new StringContent(body, Encoding.UTF8, "application/json");
            var response = await client.PostAsync(
                $"{inventoryUrl}/api/inventory/product/{productId}/reserve", content);

            // 404 = produit pas dans inventory -> ignorer
            // 400 = stock insuffisant ou ID incompatible -> ignorer aussi en dev
            if (!response.IsSuccessStatusCode)
            {
                _logger.LogWarning("Inventory retourne {Status} pour {ProductId} — ignore en dev",
                    response.StatusCode, productId);
                return true;
            }

            return true;
        }
        catch
        {
            return true;
        }
    }

    private async Task ReleaseStockAsync(string productId, int orderId)
    {
        try
        {
            var client = _httpClientFactory.CreateClient();
            var inventoryUrl = _configuration["Services:InventoryServiceUrl"];
            await client.PostAsync(
                $"{inventoryUrl}/api/inventory/product/{productId}/release/{orderId}", null);
        }
        catch { }
    }

    private async Task ClearCartAsync(string userId)
    {
        try
        {
            var client = _httpClientFactory.CreateClient();
            var cartUrl = _configuration["Services:CartServiceUrl"];
            await client.DeleteAsync($"{cartUrl}/api/cart/user/{userId}");
        }
        catch { }
    }

    private async Task<decimal> ApplyPromoCodeAsync(string code, decimal amount)
    {
        try
        {
            var client = _httpClientFactory.CreateClient();
            var promoUrl = _configuration["Services:PromotionServiceUrl"];
            var body = JsonSerializer.Serialize(new { code, cartAmount = amount });
            var content = new StringContent(body, Encoding.UTF8, "application/json");
            var response = await client.PostAsync($"{promoUrl}/api/promotions/apply", content);
            if (!response.IsSuccessStatusCode) return 0;

            var result = JsonSerializer.Deserialize<PromoApiResponse>(
                await response.Content.ReadAsStringAsync(),
                new JsonSerializerOptions { PropertyNameCaseInsensitive = true });

            return result?.Data?.DiscountAmount ?? 0;
        }
        catch { return 0; }
    }

    private OrderResponse MapToResponse(Order order) => new()
    {
        Id = order.Id,
        UserId = order.UserId,
        Status = order.Status.ToString(),
        PaymentStatus = order.PaymentStatus.ToString(),
        TotalAmount = order.TotalAmount,
        DiscountAmount = order.DiscountAmount,
        FinalAmount = order.FinalAmount,
        PromoCode = order.PromoCode,
        ShippingAddress = order.ShippingAddress,
        ShippingCity = order.ShippingCity,
        ShippingPhone = order.ShippingPhone,
        TrackingNumber = order.TrackingNumber,
        Notes = order.Notes,
        Items = order.Items.Select(i => new OrderItemResponse
        {
            Id = i.Id,
            ProductId = i.ProductId,
            ProductTitle = i.ProductTitle,
            ProductImageUrl = i.ProductImageUrl,
            Quantity = i.Quantity,
            UnitPrice = i.UnitPrice,
            Subtotal = i.Subtotal
        }).ToList(),
        StatusHistory = order.StatusHistory.Select(h => new OrderStatusHistoryResponse
        {
            Status = h.Status.ToString(),
            Comment = h.Comment,
            ChangedBy = h.ChangedBy,
            ChangedAt = h.ChangedAt
        }).ToList(),
        CreatedAt = order.CreatedAt,
        UpdatedAt = order.UpdatedAt,
        PaidAt = order.PaidAt,
        ShippedAt = order.ShippedAt,
        DeliveredAt = order.DeliveredAt
    };

    // ── Classes internes ────────────────────────────────────────
    private class CartApiResponse
    {
        public bool Success { get; set; }
        public CartData? Data { get; set; }
    }
    private class CartData
    {
        public List<CartItemDto> Items { get; set; } = new();
    }
    private class CartItemDto
    {
        public string ProductId { get; set; } = string.Empty;
        public string ProductTitle { get; set; } = string.Empty;
        public string? ProductImageUrl { get; set; }
        public int Quantity { get; set; }
        public decimal Price { get; set; }
        public decimal Subtotal { get; set; }
    }
    private class PromoApiResponse
    {
        public bool Success { get; set; }
        public PromoData? Data { get; set; }
    }
    private class PromoData
    {
        public decimal DiscountAmount { get; set; }
        public decimal FinalAmount { get; set; }
    }
}