using PaymentService.DTOs.Requests;
using PaymentService.DTOs.Responses;

namespace PaymentService.Services.Interfaces;

public interface IPaymentService
{
    Task<ApiResponse<PaymentIntentResponse>> CreatePaymentIntentAsync(string userId, CreatePaymentRequest request);
    Task<ApiResponse<PaymentResponse>> ConfirmPaymentAsync(string userId, ConfirmPaymentRequest request);
    Task<ApiResponse<PaymentResponse>> GetPaymentByOrderIdAsync(int orderId);
    Task<ApiResponse<List<PaymentResponse>>> GetPaymentsByUserIdAsync(string userId);
    Task<ApiResponse<PaymentResponse>> RefundPaymentAsync(int paymentId);
}