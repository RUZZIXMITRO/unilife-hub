using OrderService.Models;

namespace OrderService.Repositories.Interfaces;

public interface IOrderRepository
{
    Task<Order?> GetByIdAsync(int id);
    Task<Order?> GetByIdWithDetailsAsync(int id);
    Task<List<Order>> GetByUserIdAsync(string userId);
    Task<List<Order>> GetAllAsync();
    Task<List<Order>> GetByStatusAsync(OrderStatus status);
    Task<Order> CreateAsync(Order order);
    Task<Order> UpdateAsync(Order order);
    Task<OrderStatusHistory> AddStatusHistoryAsync(OrderStatusHistory history);
}