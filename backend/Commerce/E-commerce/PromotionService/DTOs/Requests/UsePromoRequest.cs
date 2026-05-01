using System.ComponentModel.DataAnnotations;

namespace PromotionService.DTOs.Requests;

public class UsePromoRequest
{
    [Required]
    public string Code { get; set; } = string.Empty;
    [Required]
    public string UserId { get; set; } = string.Empty;
    [Required]
    public int OrderId { get; set; }
    [Required]
    public decimal CartAmount { get; set; }
}