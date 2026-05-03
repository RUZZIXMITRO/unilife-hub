using PromotionService.Models;

namespace PromotionService.DTOs.Responses;

public class PromotionResponse
{
    public int Id { get; set; }
    public string Code { get; set; } = string.Empty;
    public string? Description { get; set; }
    public string DiscountType { get; set; } = string.Empty;
    public decimal DiscountValue { get; set; }
    public decimal MinAmount { get; set; }
    public decimal? MaxDiscount { get; set; }
    public DateTime ValidFrom { get; set; }
    public DateTime ValidTo { get; set; }
    public int MaxUses { get; set; }
    public int MaxUsesPerUser { get; set; }
    public int CurrentUses { get; set; }
    public bool IsActive { get; set; }
    public DateTime CreatedAt { get; set; }
}