using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace PaymentService.Models;

[Table("payments")]
public class Payment
{
    [Key]
    [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
    public int Id { get; set; }
    public int OrderId { get; set; }
    public string UserId { get; set; } = string.Empty;
    [Column(TypeName = "decimal(10,2)")]
    public decimal Amount { get; set; }
    public PaymentStatus Status { get; set; } = PaymentStatus.Pending;
    public PaymentMethodType Method { get; set; } = PaymentMethodType.Card;
    public string? StripePaymentIntentId { get; set; }
    public string? FailureReason { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
    public List<Transaction> Transactions { get; set; } = new();
}

public enum PaymentStatus { Pending, Processing, Completed, Failed, Refunded, Cancelled }
public enum PaymentMethodType { Card, BankTransfer }
