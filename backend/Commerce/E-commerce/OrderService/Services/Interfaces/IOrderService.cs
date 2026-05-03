using OrderService.DTOs.Requests;
using OrderService.DTOs.Responses;

namespace OrderService.Services.Interfaces;

public interface IOrderService
{
    Task<ApiResponse<OrderResponse>> CreateOrderAsync(string userId, CreateOrderRequest request);
    Task<ApiResponse<OrderResponse>> GetOrderByIdAsync(int orderId, string userId);
    Task<ApiResponse<List<OrderResponse>>> GetMyOrdersAsync(string userId);
    Task<ApiResponse<List<OrderResponse>>> GetAllOrdersAsync();
    Task<ApiResponse<OrderResponse>> UpdateOrderStatusAsync(int orderId, UpdateOrderStatusRequest request, string changedBy);
    Task<ApiResponse<OrderResponse>> ConfirmPaymentAsync(int orderId, string paymentIntentId);
    Task<ApiResponse<OrderResponse>> CancelOrderAsync(int orderId, string userId);
}