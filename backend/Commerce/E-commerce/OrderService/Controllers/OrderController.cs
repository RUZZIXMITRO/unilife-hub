using Microsoft.AspNetCore.Mvc;
using OrderService.DTOs.Requests;
using OrderService.DTOs.Responses;
using OrderService.Services.Interfaces;

namespace OrderService.Controllers;

/// <summary>
/// Controller REST pour les commandes.
/// SOLID - S : recoit HTTP et delegue au service.
/// SOLID - D : depend de IOrderService (interface).
/// </summary>
[ApiController]
[Route("api/orders")]
public class OrderController : ControllerBase
{
    private readonly IOrderService _orderService;

    public OrderController(IOrderService orderService)
    {
        _orderService = orderService;
    }

    [HttpPost]
    public async Task<ActionResult<ApiResponse<OrderResponse>>> CreateOrder(
        [FromBody] CreateOrderRequest request)
    {
        if (!ModelState.IsValid) return BadRequest(ModelState);
        var userId = GetUserId();
        if (userId == null) return Unauthorized();
        var result = await _orderService.CreateOrderAsync(userId, request);
        return result.Success ? StatusCode(201, result) : BadRequest(result);
    }

    [HttpGet("{orderId}")]
    public async Task<ActionResult<ApiResponse<OrderResponse>>> GetOrder(int orderId)
    {
        var userId = GetUserId();
        if (userId == null) return Unauthorized();
        var result = await _orderService.GetOrderByIdAsync(orderId, userId);
        return result.Success ? Ok(result) : NotFound(result);
    }

    [HttpGet("my-orders")]
    public async Task<ActionResult<ApiResponse<List<OrderResponse>>>> GetMyOrders()
    {
        var userId = GetUserId();
        if (userId == null) return Unauthorized();
        var result = await _orderService.GetMyOrdersAsync(userId);
        return Ok(result);
    }

    [HttpGet]
    public async Task<ActionResult<ApiResponse<List<OrderResponse>>>> GetAllOrders()
    {
        var result = await _orderService.GetAllOrdersAsync();
        return Ok(result);
    }

    [HttpPut("{orderId}/status")]
    public async Task<ActionResult<ApiResponse<OrderResponse>>> UpdateStatus(
        int orderId, [FromBody] UpdateOrderStatusRequest request)
    {
        var userId = GetUserId() ?? "admin";
        var result = await _orderService.UpdateOrderStatusAsync(orderId, request, userId);
        return result.Success ? Ok(result) : BadRequest(result);
    }

    [HttpPost("{orderId}/confirm-payment")]
    public async Task<ActionResult<ApiResponse<OrderResponse>>> ConfirmPayment(
        int orderId, [FromQuery] string paymentIntentId)
    {
        var result = await _orderService.ConfirmPaymentAsync(orderId, paymentIntentId);
        return result.Success ? Ok(result) : BadRequest(result);
    }

    [HttpPost("{orderId}/cancel")]
    public async Task<ActionResult<ApiResponse<OrderResponse>>> CancelOrder(int orderId)
    {
        var userId = GetUserId();
        if (userId == null) return Unauthorized();
        var result = await _orderService.CancelOrderAsync(orderId, userId);
        return result.Success ? Ok(result) : BadRequest(result);
    }

    private string? GetUserId() =>
        Request.Headers.TryGetValue("X-User-Id", out var userId)
            ? userId.ToString()
            : null;
}