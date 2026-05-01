using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace PaymentService.Models;

[Table("transactions")]
public class Transaction
{
    [Key]
    [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
    public int Id { get; set; }
    public int PaymentId { get; set; }
    public TransactionType Type { get; set; }
    [Column(TypeName = "decimal(10,2)")]
    public decimal Amount { get; set; }
    public TransactionStatus Status { get; set; }
    public string? StripeTransactionId { get; set; }
    public string? Description { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    [ForeignKey("PaymentId")]
    public Payment? Payment { get; set; }
}

public enum TransactionType { Charge, Refund }
public enum TransactionStatus { Success, Failed, Pending }