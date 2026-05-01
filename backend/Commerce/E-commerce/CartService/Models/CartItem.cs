using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace CartService.Models;

/// <summary>
/// Article dans un panier.
/// SOLID - S : represente uniquement un article du panier.
/// </summary>
[Table("cart_items")]
public class CartItem
{
    [Key]
    [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
    public int Id { get; set; }

    [Required]
    public int CartId { get; set; }

    [Required]
    public string ProductId { get; set; } = string.Empty;

    [Required]
    public int Quantity { get; set; } = 1;

    [Required]
    [Column(TypeName = "decimal(10,2)")]
    public decimal Price { get; set; }

    public string ProductTitle { get; set; } = string.Empty;
    public string? ProductImageUrl { get; set; }

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    // Navigation property
    [ForeignKey("CartId")]
    public Cart? Cart { get; set; }
}