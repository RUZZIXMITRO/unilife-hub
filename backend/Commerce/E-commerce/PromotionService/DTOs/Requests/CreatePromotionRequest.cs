using System.ComponentModel.DataAnnotations;
using PromotionService.Models;

namespace PromotionService.DTOs.Requests;

public class CreatePromotionRequest
{
    [Required]
    public string Code { get; set; } = string.Empty;
    public string? Description { get; set; }
    [Required]
    public DiscountType DiscountType { get; set; }
    [Required]
    [Range(0.01, double.MaxValue)]
    public decimal DiscountValue { get; set; }
    public decimal MinAmount { get; set; } = 0;
    public decimal? MaxDiscount { get; set; }
    [Required]
    public DateTime ValidFrom { get; set; }
    [Required]
    public DateTime ValidTo { get; set; }
    public int MaxUses { get; set; } = 0;
    public int MaxUsesPerUser { get; set; } = 1;
}