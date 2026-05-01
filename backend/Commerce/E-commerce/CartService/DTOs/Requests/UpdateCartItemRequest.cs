using System.ComponentModel.DataAnnotations;

namespace CartService.DTOs.Requests;

public class UpdateCartItemRequest
{
    [Required]
    [Range(1, 100, ErrorMessage = "La quantite doit etre entre 1 et 100")]
    public int Quantity { get; set; }
}