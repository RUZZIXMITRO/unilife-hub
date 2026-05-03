using PaymentService.Models;

namespace PaymentService.Repositories.Interfaces;

public interface IPaymentRepository
{
    Task<Payment?> GetByIdAsync(int id);
    Task<Payment?> GetByOrderIdAsync(int orderId);
    Task<Payment?> GetByStripePaymentIntentIdAsync(string paymentIntentId);
    Task<List<Payment>> GetByUserIdAsync(string userId);
    Task<Payment> CreateAsync(Payment payment);
    Task<Payment> UpdateAsync(Payment payment);
    Task<Transaction> AddTransactionAsync(Transaction transaction);
}