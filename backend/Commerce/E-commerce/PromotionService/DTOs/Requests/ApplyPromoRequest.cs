using System.ComponentModel.DataAnnotations;

namespace PromotionService.DTOs.Requests;

public class ApplyPromoRequest
{
    [Required]
    public string Code { get; set; } = string.Empty;
    [Required]
    [Range(0.01, double.MaxValue)]
    public decimal CartAmount { get; set; }
    public string UserId { get; set; } = string.Empty;
}