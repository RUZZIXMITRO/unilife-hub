using CartService.DTOs.Requests;
using CartService.DTOs.Responses;

namespace CartService.Services.Interfaces;

/// <summary>
/// Interface du service panier.
/// SOLID - I : interface ciblee, ne contient que les methodes panier.
/// SOLID - D : le controller depend de cette interface.
/// </summary>
public interface ICartService
{
    Task<ApiResponse<CartResponse>> GetCartAsync(string userId);
    Task<ApiResponse<CartResponse>> AddToCartAsync(string userId, AddToCartRequest request);
    Task<ApiResponse<CartResponse>> UpdateCartItemAsync(string userId, int itemId, UpdateCartItemRequest request);
    Task<ApiResponse<bool>> RemoveFromCartAsync(string userId, int itemId);
    Task<ApiResponse<bool>> ClearCartAsync(string userId);
    Task<ApiResponse<CartResponse>> GetCartForOrderAsync(string userId);
}