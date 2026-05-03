using System.ComponentModel.DataAnnotations;

namespace PaymentService.DTOs.Requests;

public class ConfirmPaymentRequest
{
    [Required]
    public string PaymentIntentId { get; set; } = string.Empty;
}