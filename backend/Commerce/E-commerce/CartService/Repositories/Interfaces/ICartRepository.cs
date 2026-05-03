using CartService.Models;

namespace CartService.Repositories.Interfaces;

/// <summary>
/// Interface du repository panier.
/// SOLID - D : le service depend de cette interface, jamais de l implementation.
/// Design Pattern : Repository Pattern.
/// </summary>
public interface ICartRepository
{
    Task<Cart?> GetCartByUserIdAsync(string userId);
    Task<Cart?> GetCartWithItemsByUserIdAsync(string userId);
    Task<Cart> CreateCartAsync(string userId);
    Task<Cart> UpdateCartAsync(Cart cart);
    Task DeleteCartAsync(string userId);
    Task<CartItem?> GetCartItemAsync(int cartId, string productId);
    Task<CartItem> AddCartItemAsync(CartItem item);
    Task<CartItem> UpdateCartItemAsync(CartItem item);
    Task DeleteCartItemAsync(int itemId);
    Task ClearCartAsync(string userId);
}