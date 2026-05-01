using Microsoft.EntityFrameworkCore;
using PaymentService.Data;
using PaymentService.Models;
using PaymentService.Repositories.Interfaces;

namespace PaymentService.Repositories.Implementations;

public class PaymentRepository : IPaymentRepository
{
    private readonly PaymentDbContext _context;

    public PaymentRepository(PaymentDbContext context) { _context = context; }

    public async Task<Payment?> GetByIdAsync(int id) =>
        await _context.Payments.Include(p => p.Transactions).FirstOrDefaultAsync(p => p.Id == id);

    public async Task<Payment?> GetByOrderIdAsync(int orderId) =>
        await _context.Payments.Include(p => p.Transactions).FirstOrDefaultAsync(p => p.OrderId == orderId);

    public async Task<Payment?> GetByStripePaymentIntentIdAsync(string paymentIntentId) =>
        await _context.Payments.FirstOrDefaultAsync(p => p.StripePaymentIntentId == paymentIntentId);

    public async Task<List<Payment>> GetByUserIdAsync(string userId) =>
        await _context.Payments.Where(p => p.UserId == userId)
            .OrderByDescending(p => p.CreatedAt).ToListAsync();

    public async Task<Payment> CreateAsync(Payment payment)
    {
        _context.Payments.Add(payment);
        await _context.SaveChangesAsync();
        return payment;
    }

    public async Task<Payment> UpdateAsync(Payment payment)
    {
        payment.UpdatedAt = DateTime.UtcNow;
        _context.Payments.Update(payment);
        await _context.SaveChangesAsync();
        return payment;
    }

    public async Task<Transaction> AddTransactionAsync(Transaction transaction)
    {
        _context.Transactions.Add(transaction);
        await _context.SaveChangesAsync();
        return transaction;
    }
}