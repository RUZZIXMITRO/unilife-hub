using System.ComponentModel.DataAnnotations;

namespace OrderService.DTOs.Requests;

public class CreateOrderRequest
{
    [Required(ErrorMessage = "L adresse de livraison est obligatoire")]
    public string ShippingAddress { get; set; } = string.Empty;

    public string? ShippingCity { get; set; }

    [Required(ErrorMessage = "Le numero de telephone est obligatoire")]
    public string ShippingPhone { get; set; } = string.Empty;

    public string? PromoCode { get; set; }
    public string? Notes { get; set; }
}