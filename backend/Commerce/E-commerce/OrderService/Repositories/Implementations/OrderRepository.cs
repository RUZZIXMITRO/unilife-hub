using Microsoft.EntityFrameworkCore;
using OrderService.Data;
using OrderService.Models;
using OrderService.Repositories.Interfaces;

namespace OrderService.Repositories.Implementations;

public class OrderRepository : IOrderRepository
{
    private readonly OrderDbContext _context;

    public OrderRepository(OrderDbContext context) { _context = context; }

    public async Task<Order?> GetByIdAsync(int id) =>
        await _context.Orders.FindAsync(id);

    public async Task<Order?> GetByIdWithDetailsAsync(int id) =>
        await _context.Orders
            .Include(o => o.Items)
            .Include(o => o.StatusHistory.OrderByDescending(h => h.ChangedAt))
            .FirstOrDefaultAsync(o => o.Id == id);

    public async Task<List<Order>> GetByUserIdAsync(string userId) =>
        await _context.Orders
            .Include(o => o.Items)
            .Where(o => o.UserId == userId)
            .OrderByDescending(o => o.CreatedAt)
            .ToListAsync();

    public async Task<List<Order>> GetAllAsync() =>
        await _context.Orders
            .Include(o => o.Items)
            .OrderByDescending(o => o.CreatedAt)
            .ToListAsync();

    public async Task<List<Order>> GetByStatusAsync(OrderStatus status) =>
        await _context.Orders
            .Include(o => o.Items)
            .Where(o => o.Status == status)
            .OrderByDescending(o => o.CreatedAt)
            .ToListAsync();

    public async Task<Order> CreateAsync(Order order)
    {
        _context.Orders.Add(order);
        await _context.SaveChangesAsync();
        return order;
    }

    public async Task<Order> UpdateAsync(Order order)
    {
        order.UpdatedAt = DateTime.UtcNow;
        _context.Orders.Update(order);
        await _context.SaveChangesAsync();
        return order;
    }

    public async Task<OrderStatusHistory> AddStatusHistoryAsync(OrderStatusHistory history)
    {
        _context.OrderStatusHistories.Add(history);
        await _context.SaveChangesAsync();
        return history;
    }
}