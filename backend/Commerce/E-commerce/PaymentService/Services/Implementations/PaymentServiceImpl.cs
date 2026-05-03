using PaymentService.DTOs.Requests;
using PaymentService.DTOs.Responses;
using PaymentService.Models;
using PaymentService.Repositories.Interfaces;
using PaymentService.Services.Interfaces;
using Stripe;

namespace PaymentService.Services.Implementations;

/// <summary>
/// Service paiement avec Stripe.
/// SOLID - S : chaque methode a une responsabilite unique.
/// SOLID - D : depend des interfaces IPaymentRepository.
///
/// Flux Stripe :
/// 1. CreatePaymentIntent -> Stripe cree un PaymentIntent + ClientSecret
/// 2. Angular affiche le formulaire carte Stripe avec le ClientSecret
/// 3. Stripe traite le paiement cote client (securise)
/// 4. ConfirmPayment -> on verifie le statut chez Stripe et on met a jour notre DB
/// </summary>
public class PaymentServiceImpl : IPaymentService
{
    private readonly IPaymentRepository _paymentRepository;
    private readonly IConfiguration _configuration;
    private readonly ILogger<PaymentServiceImpl> _logger;
    private readonly HttpClient _httpClient;

    public PaymentServiceImpl(
        IPaymentRepository paymentRepository,
        IConfiguration configuration,
        ILogger<PaymentServiceImpl> logger,
        IHttpClientFactory httpClientFactory)
    {
        _paymentRepository = paymentRepository;
        _configuration = configuration;
        _logger = logger;
        _httpClient = httpClientFactory.CreateClient();
        StripeConfiguration.ApiKey = configuration["Stripe:SecretKey"];
    }

    public async Task<ApiResponse<PaymentIntentResponse>> CreatePaymentIntentAsync(
        string userId, CreatePaymentRequest request)
    {
        _logger.LogInformation("Creation PaymentIntent pour commande {OrderId}", request.OrderId);

        try
        {
            // Creer le PaymentIntent chez Stripe
            var options = new PaymentIntentCreateOptions
            {
                Amount = (long)(request.Amount * 100), // Stripe utilise les centimes
                Currency = request.Currency,
                AutomaticPaymentMethods = new PaymentIntentAutomaticPaymentMethodsOptions
                {
                    Enabled = true
                },
                Metadata = new Dictionary<string, string>
                {
                    { "orderId", request.OrderId.ToString() },
                    { "userId", userId }
                }
            };

            var service = new PaymentIntentService();
            var paymentIntent = await service.CreateAsync(options);

            // Sauvegarder en DB avec statut Pending
            var payment = new Models.Payment
            {
                OrderId = request.OrderId,
                UserId = userId,
                Amount = request.Amount,
                Status = PaymentStatus.Pending,
                Method = PaymentMethodType.Card,
                StripePaymentIntentId = paymentIntent.Id
            };

            await _paymentRepository.CreateAsync(payment);

            await _paymentRepository.AddTransactionAsync(new Transaction
            {
                PaymentId = payment.Id,
                Type = TransactionType.Charge,
                Amount = request.Amount,
                Status = TransactionStatus.Pending,
                StripeTransactionId = paymentIntent.Id,
                Description = "PaymentIntent cree"
            });

            _logger.LogInformation("PaymentIntent cree : {Id}", paymentIntent.Id);

            return ApiResponse<PaymentIntentResponse>.SuccessResponse(
                "PaymentIntent cree - utilisez le ClientSecret dans Angular",
                new PaymentIntentResponse
                {
                    PaymentIntentId = paymentIntent.Id,
                    ClientSecret = paymentIntent.ClientSecret,
                    PublishableKey = _configuration["Stripe:PublishableKey"]!,
                    Amount = request.Amount,
                    Currency = request.Currency,
                    Status = paymentIntent.Status
                });
        }
        catch (StripeException ex)
        {
            _logger.LogError("Erreur Stripe : {Message}", ex.Message);
            return ApiResponse<PaymentIntentResponse>.ErrorResponse($"Erreur Stripe : {ex.Message}");
        }
    }

    public async Task<ApiResponse<PaymentResponse>> ConfirmPaymentAsync(
        string userId, ConfirmPaymentRequest request)
    {
        _logger.LogInformation("Confirmation paiement : {Id}", request.PaymentIntentId);

        try
        {
            // Verifier le statut chez Stripe
            var service = new PaymentIntentService();
            var paymentIntent = await service.GetAsync(request.PaymentIntentId);

            var payment = await _paymentRepository.GetByStripePaymentIntentIdAsync(request.PaymentIntentId);
            if (payment == null)
                return ApiResponse<PaymentResponse>.ErrorResponse("Paiement introuvable");

            // Mettre a jour le statut selon Stripe
            payment.Status = paymentIntent.Status switch
            {
                "succeeded" => PaymentStatus.Completed,
                "processing" => PaymentStatus.Processing,
                "payment_failed" => PaymentStatus.Failed,
                _ => PaymentStatus.Pending
            };

            if (payment.Status == PaymentStatus.Failed)
                payment.FailureReason = paymentIntent.LastPaymentError?.Message;

            await _paymentRepository.UpdateAsync(payment);

            await _paymentRepository.AddTransactionAsync(new Transaction
            {
                PaymentId = payment.Id,
                Type = TransactionType.Charge,
                Amount = payment.Amount,
                Status = payment.Status == PaymentStatus.Completed
                    ? TransactionStatus.Success
                    : TransactionStatus.Failed,
                StripeTransactionId = paymentIntent.LatestChargeId,
                Description = $"Paiement {paymentIntent.Status}"
            });

            _logger.LogInformation("Paiement {Status} pour commande {OrderId}",
                payment.Status, payment.OrderId);

            return ApiResponse<PaymentResponse>.SuccessResponse(
                $"Paiement {payment.Status}",
                MapToResponse(payment));
        }
        catch (StripeException ex)
        {
            _logger.LogError("Erreur Stripe confirmation : {Message}", ex.Message);
            return ApiResponse<PaymentResponse>.ErrorResponse($"Erreur Stripe : {ex.Message}");
        }
    }

    public async Task<ApiResponse<PaymentResponse>> GetPaymentByOrderIdAsync(int orderId)
    {
        var payment = await _paymentRepository.GetByOrderIdAsync(orderId);
        if (payment == null)
            return ApiResponse<PaymentResponse>.ErrorResponse("Paiement introuvable");
        return ApiResponse<PaymentResponse>.SuccessResponse("Paiement trouve", MapToResponse(payment));
    }

    public async Task<ApiResponse<List<PaymentResponse>>> GetPaymentsByUserIdAsync(string userId)
    {
        var payments = await _paymentRepository.GetByUserIdAsync(userId);
        return ApiResponse<List<PaymentResponse>>.SuccessResponse(
            "Paiements de l utilisateur",
            payments.Select(MapToResponse).ToList());
    }

    public async Task<ApiResponse<PaymentResponse>> RefundPaymentAsync(int paymentId)
    {
        var payment = await _paymentRepository.GetByIdAsync(paymentId);
        if (payment == null)
            return ApiResponse<PaymentResponse>.ErrorResponse("Paiement introuvable");

        if (payment.Status != PaymentStatus.Completed)
            return ApiResponse<PaymentResponse>.ErrorResponse("Seuls les paiements completes peuvent etre rembourses");

        try
        {
            var options = new RefundCreateOptions
            {
                PaymentIntent = payment.StripePaymentIntentId
            };
            var service = new RefundService();
            var refund = await service.CreateAsync(options);

            payment.Status = PaymentStatus.Refunded;
            await _paymentRepository.UpdateAsync(payment);

            await _paymentRepository.AddTransactionAsync(new Transaction
            {
                PaymentId = payment.Id,
                Type = TransactionType.Refund,
                Amount = payment.Amount,
                Status = TransactionStatus.Success,
                StripeTransactionId = refund.Id,
                Description = "Remboursement Stripe"
            });

            return ApiResponse<PaymentResponse>.SuccessResponse("Remboursement effectue", MapToResponse(payment));
        }
        catch (StripeException ex)
        {
            return ApiResponse<PaymentResponse>.ErrorResponse($"Erreur remboursement : {ex.Message}");
        }
    }

    private PaymentResponse MapToResponse(Models.Payment payment) => new()
    {
        Id = payment.Id,
        OrderId = payment.OrderId,
        UserId = payment.UserId,
        Amount = payment.Amount,
        Status = payment.Status.ToString(),
        Method = payment.Method.ToString(),
        StripePaymentIntentId = payment.StripePaymentIntentId,
        FailureReason = payment.FailureReason,
        CreatedAt = payment.CreatedAt,
        UpdatedAt = payment.UpdatedAt
    };
}