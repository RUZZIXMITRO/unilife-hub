using System.ComponentModel.DataAnnotations;
using OrderService.Models;

namespace OrderService.DTOs.Requests;

public class UpdateOrderStatusRequest
{
    [Required]
    public OrderStatus Status { get; set; }
    public string? Comment { get; set; }
    public string? TrackingNumber { get; set; }
}