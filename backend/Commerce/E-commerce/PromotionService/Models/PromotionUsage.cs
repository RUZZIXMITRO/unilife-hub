using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace PromotionService.Models;

/// <summary>
/// Historique d utilisation des codes promo.
/// SOLID - S : trace uniquement une utilisation.
/// Design Pattern : Audit Trail.
/// </summary>
[Table("promotion_usages")]
public class PromotionUsage
{
    [Key]
    [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
    public int Id { get; set; }

    public int PromotionId { get; set; }
    public string UserId { get; set; } = string.Empty;
    public int OrderId { get; set; }

    [Column(TypeName = "decimal(10,2)")]
    public decimal DiscountApplied { get; set; }

    public DateTime UsedAt { get; set; } = DateTime.UtcNow;

    [ForeignKey("PromotionId")]
    public Promotion? Promotion { get; set; }
}