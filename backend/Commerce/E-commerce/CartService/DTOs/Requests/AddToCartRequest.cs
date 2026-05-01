using System.ComponentModel.DataAnnotations;

namespace CartService.DTOs.Requests;

public class AddToCartRequest
{
    [Required(ErrorMessage = "L ID du produit est obligatoire")]
    public string ProductId { get; set; } = string.Empty;

    [Required]
    [Range(1, 100, ErrorMessage = "La quantite doit etre entre 1 et 100")]
    public int Quantity { get; set; } = 1;
}