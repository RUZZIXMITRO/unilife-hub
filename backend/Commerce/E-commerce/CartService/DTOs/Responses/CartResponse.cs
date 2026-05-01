namespace CartService.DTOs.Responses;

public class CartResponse
{
    public int Id { get; set; }
    public string UserId { get; set; } = string.Empty;
    public List<CartItemResponse> Items { get; set; } = new();
    public decimal TotalAmount { get; set; }
    public int TotalItems { get; set; }
    public DateTime UpdatedAt { get; set; }
}