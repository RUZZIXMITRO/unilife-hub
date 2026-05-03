using System.ComponentModel.DataAnnotations;

namespace PaymentService.DTOs.Requests;

public class CreatePaymentRequest
{
    [Required]
    public int OrderId { get; set; }
    [Required]
    [Range(0.01, double.MaxValue)]
    public decimal Amount { get; set; }
    public string Currency { get; set; } = "eur";
}