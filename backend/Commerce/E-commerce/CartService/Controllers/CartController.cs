using CartService.DTOs.Requests;
using CartService.DTOs.Responses;
using CartService.Services.Interfaces;
using Microsoft.AspNetCore.Mvc;

namespace CartService.Controllers;

/// <summary>
/// Controller REST pour le panier.
/// SOLID - S : recoit HTTP et delegue au service — zero logique.
/// SOLID - D : depend de ICartService (interface).
///
/// Le UserId vient du header X-User-Id injecte par l API Gateway YARP.
/// </summary>
[ApiController]
[Route("api/cart")]
public class CartController : ControllerBase
{
    private readonly ICartService _cartService;
    private readonly ILogger<CartController> _logger;

    public CartController(ICartService cartService, ILogger<CartController> logger)
    {
        _cartService = cartService;
        _logger = logger;
    }

    [HttpGet]
    public async Task<ActionResult<ApiResponse<CartResponse>>> GetCart()
    {
        var userId = GetUserId();
        if (userId == null)
            return Unauthorized(ApiResponse<CartResponse>.ErrorResponse("Utilisateur non authentifie"));

        var result = await _cartService.GetCartAsync(userId);
        return Ok(result);
    }

    [HttpPost("items")]
    public async Task<ActionResult<ApiResponse<CartResponse>>> AddToCart(
        [FromBody] AddToCartRequest request)
    {
        if (!ModelState.IsValid)
            return BadRequest(ModelState);

        var userId = GetUserId();
        if (userId == null)
            return Unauthorized(ApiResponse<CartResponse>.ErrorResponse("Utilisateur non authentifie"));

        var result = await _cartService.AddToCartAsync(userId, request);
        return result.Success ? Ok(result) : BadRequest(result);
    }

    [HttpPut("items/{itemId}")]
    public async Task<ActionResult<ApiResponse<CartResponse>>> UpdateCartItem(
        int itemId, [FromBody] UpdateCartItemRequest request)
    {
        if (!ModelState.IsValid)
            return BadRequest(ModelState);

        var userId = GetUserId();
        if (userId == null)
            return Unauthorized(ApiResponse<CartResponse>.ErrorResponse("Utilisateur non authentifie"));

        var result = await _cartService.UpdateCartItemAsync(userId, itemId, request);
        return result.Success ? Ok(result) : BadRequest(result);
    }

    [HttpDelete("items/{itemId}")]
    public async Task<ActionResult<ApiResponse<bool>>> RemoveFromCart(int itemId)
    {
        var userId = GetUserId();
        if (userId == null)
            return Unauthorized(ApiResponse<bool>.ErrorResponse("Utilisateur non authentifie"));

        var result = await _cartService.RemoveFromCartAsync(userId, itemId);
        return result.Success ? Ok(result) : BadRequest(result);
    }

    [HttpDelete]
    public async Task<ActionResult<ApiResponse<bool>>> ClearCart()
    {
        var userId = GetUserId();
        if (userId == null)
            return Unauthorized(ApiResponse<bool>.ErrorResponse("Utilisateur non authentifie"));

        var result = await _cartService.ClearCartAsync(userId);
        return Ok(result);
    }

    /// <summary>
    /// Endpoint interne appele par OrderService pour recuperer le panier.
    /// </summary>
    [HttpGet("user/{userId}")]
    public async Task<ActionResult<ApiResponse<CartResponse>>> GetCartByUserId(string userId)
    {
        var result = await _cartService.GetCartForOrderAsync(userId);
        return result.Success ? Ok(result) : BadRequest(result);
    }

    /// <summary>
    /// Endpoint interne appele par OrderService apres confirmation de commande.
    /// </summary>
    [HttpDelete("user/{userId}")]
    public async Task<ActionResult<ApiResponse<bool>>> ClearCartByUserId(string userId)
    {
        var result = await _cartService.ClearCartAsync(userId);
        return Ok(result);
    }

    private string? GetUserId() =>
    Request.Headers.TryGetValue("X-User-Id", out var userId)
        ? userId.ToString()
        : null;
}