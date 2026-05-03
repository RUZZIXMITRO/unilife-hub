using Microsoft.AspNetCore.Mvc;
using PaymentService.DTOs.Requests;
using PaymentService.DTOs.Responses;
using PaymentService.Services.Interfaces;

namespace PaymentService.Controllers;

/// <summary>
/// Controller REST pour les paiements Stripe.
/// SOLID - S : recoit HTTP et delegue au service.
/// SOLID - D : depend de IPaymentService (interface).
/// </summary>
[ApiController]
[Route("api/payment")]
public class PaymentController : ControllerBase
{
    private readonly IPaymentService _paymentService;

    public PaymentController(IPaymentService paymentService)
    {
        _paymentService = paymentService;
    }

    /// <summary>
    /// Etape 1 : Creer un PaymentIntent Stripe.
    /// Retourne le ClientSecret pour Angular Stripe Elements.
    /// </summary>
    [HttpPost("create-intent")]
    public async Task<ActionResult<ApiResponse<PaymentIntentResponse>>> CreatePaymentIntent(
        [FromBody] CreatePaymentRequest request)
    {
        if (!ModelState.IsValid) return BadRequest(ModelState);

        var userId = GetUserId();
        if (userId == null)
            return Unauthorized(ApiResponse<PaymentIntentResponse>.ErrorResponse("Non authentifie"));

        var result = await _paymentService.CreatePaymentIntentAsync(userId, request);
        return result.Success ? Ok(result) : BadRequest(result);
    }

    /// <summary>
    /// Etape 2 : Confirmer le paiement apres traitement Stripe cote client.
    /// </summary>
    [HttpPost("confirm")]
    public async Task<ActionResult<ApiResponse<PaymentResponse>>> ConfirmPayment(
        [FromBody] ConfirmPaymentRequest request)
    {
        if (!ModelState.IsValid) return BadRequest(ModelState);

        var userId = GetUserId();
        if (userId == null)
            return Unauthorized(ApiResponse<PaymentResponse>.ErrorResponse("Non authentifie"));

        var result = await _paymentService.ConfirmPaymentAsync(userId, request);
        return result.Success ? Ok(result) : BadRequest(result);
    }

    [HttpGet("order/{orderId}")]
    public async Task<ActionResult<ApiResponse<PaymentResponse>>> GetByOrderId(int orderId)
    {
        var result = await _paymentService.GetPaymentByOrderIdAsync(orderId);
        return result.Success ? Ok(result) : NotFound(result);
    }

    [HttpGet("my-payments")]
    public async Task<ActionResult<ApiResponse<List<PaymentResponse>>>> GetMyPayments()
    {
        var userId = GetUserId();
        if (userId == null)
            return Unauthorized(ApiResponse<List<PaymentResponse>>.ErrorResponse("Non authentifie"));

        var result = await _paymentService.GetPaymentsByUserIdAsync(userId);
        return Ok(result);
    }

    [HttpPost("{paymentId}/refund")]
    public async Task<ActionResult<ApiResponse<PaymentResponse>>> Refund(int paymentId)
    {
        var result = await _paymentService.RefundPaymentAsync(paymentId);
        return result.Success ? Ok(result) : BadRequest(result);
    }

    private string? GetUserId() =>
        Request.Headers.TryGetValue("X-User-Id", out var userId)
            ? userId.ToString()
            : null;
}