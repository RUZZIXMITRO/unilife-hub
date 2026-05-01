using CartService.Data;
using CartService.Models;
using CartService.Repositories.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace CartService.Repositories.Implementations;

/// <summary>
/// Implementation du repository panier avec SQL Server.
/// SOLID - S : responsabilite unique = acces donnees panier.
/// Design Pattern : Repository Pattern.
/// </summary>
public class CartRepository : ICartRepository
{
    private readonly CartDbContext _context;

    public CartRepository(CartDbContext context)
    {
        _context = context;
    }

    public async Task<Cart?> GetCartByUserIdAsync(string userId) =>
        await _context.Carts.FirstOrDefaultAsync(c => c.UserId == userId);

    public async Task<Cart?> GetCartWithItemsByUserIdAsync(string userId) =>
        await _context.Carts
            .Include(c => c.Items)
            .FirstOrDefaultAsync(c => c.UserId == userId);

    public async Task<Cart> CreateCartAsync(string userId)
    {
        var cart = new Cart { UserId = userId };
        _context.Carts.Add(cart);
        await _context.SaveChangesAsync();
        return cart;
    }

    public async Task<Cart> UpdateCartAsync(Cart cart)
    {
        cart.UpdatedAt = DateTime.UtcNow;
        _context.Carts.Update(cart);
        await _context.SaveChangesAsync();
        return cart;
    }

    public async Task DeleteCartAsync(string userId)
    {
        var cart = await GetCartByUserIdAsync(userId);
        if (cart != null)
        {
            _context.Carts.Remove(cart);
            await _context.SaveChangesAsync();
        }
    }

    public async Task<CartItem?> GetCartItemAsync(int cartId, string productId) =>
        await _context.CartItems
            .FirstOrDefaultAsync(ci => ci.CartId == cartId && ci.ProductId == productId);

    public async Task<CartItem> AddCartItemAsync(CartItem item)
    {
        _context.CartItems.Add(item);
        await _context.SaveChangesAsync();
        return item;
    }

    public async Task<CartItem> UpdateCartItemAsync(CartItem item)
    {
        _context.CartItems.Update(item);
        await _context.SaveChangesAsync();
        return item;
    }

    public async Task DeleteCartItemAsync(int itemId)
    {
        var item = await _context.CartItems.FindAsync(itemId);
        if (item != null)
        {
            _context.CartItems.Remove(item);
            await _context.SaveChangesAsync();
        }
    }

    public async Task ClearCartAsync(string userId)
    {
        var cart = await GetCartWithItemsByUserIdAsync(userId);
        if (cart != null)
        {
            _context.CartItems.RemoveRange(cart.Items);
            await _context.SaveChangesAsync();
        }
    }
}