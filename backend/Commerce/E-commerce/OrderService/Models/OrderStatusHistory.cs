using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace OrderService.Models;

/// <summary>
/// Historique des changements de statut.
/// SOLID - S : trace uniquement un changement de statut.
/// Design Pattern : Audit Trail.
/// </summary>
[Table("order_status_history")]
public class OrderStatusHistory
{
    [Key]
    [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
    public int Id { get; set; }

    public int OrderId { get; set; }

    public OrderStatus Status { get; set; }
    public string? Comment { get; set; }
    public string ChangedBy { get; set; } = string.Empty;

    public DateTime ChangedAt { get; set; } = DateTime.UtcNow;

    [ForeignKey("OrderId")]
    public Order? Order { get; set; }
}