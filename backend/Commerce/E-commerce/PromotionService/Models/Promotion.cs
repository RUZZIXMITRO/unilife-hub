using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace PromotionService.Models;

/// <summary>
/// Promotion / code promo.
/// SOLID - S : represente uniquement la donnee promotion.
/// </summary>
[Table("promotions")]
public class Promotion
{
    [Key]
    [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
    public int Id { get; set; }

    [Required]
    public string Code { get; set; } = string.Empty;

    public string? Description { get; set; }

    [Required]
    public DiscountType DiscountType { get; set; }

    [Required]
    [Column(TypeName = "decimal(10,2)")]
    public decimal DiscountValue { get; set; }

    [Column(TypeName = "decimal(10,2)")]
    public decimal MinAmount { get; set; } = 0;

    [Column(TypeName = "decimal(10,2)")]
    public decimal? MaxDiscount { get; set; }

    [Required]
    public DateTime ValidFrom { get; set; }

    [Required]
    public DateTime ValidTo { get; set; }

    public int MaxUses { get; set; } = 0;
    public int MaxUsesPerUser { get; set; } = 1;
    public int CurrentUses { get; set; } = 0;

    public bool IsActive { get; set; } = true;

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;

    public List<PromotionUsage> Usages { get; set; } = new();
}

public enum DiscountType
{
    Percentage,
    Fixed
}