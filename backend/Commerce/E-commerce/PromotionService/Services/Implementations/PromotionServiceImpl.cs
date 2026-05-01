using PromotionService.DTOs.Requests;
using PromotionService.DTOs.Responses;
using PromotionService.Models;
using PromotionService.Repositories.Interfaces;
using PromotionService.Services.Interfaces;

namespace PromotionService.Services.Implementations;

/// <summary>
/// Service gestion des codes promo.
/// SOLID - S : chaque methode a une responsabilite unique.
/// SOLID - D : depend de IPromotionRepository (interface).
///
/// Deux types de remises :
/// - Percentage : ex 20% de remise sur le montant total
/// - Fixed : ex 10 EUR de remise fixe
/// </summary>
public class PromotionServiceImpl : IPromotionService
{
    private readonly IPromotionRepository _promotionRepository;
    private readonly ILogger<PromotionServiceImpl> _logger;

    public PromotionServiceImpl(IPromotionRepository promotionRepository,
        ILogger<PromotionServiceImpl> logger)
    {
        _promotionRepository = promotionRepository;
        _logger = logger;
    }

    public async Task<ApiResponse<PromotionResponse>> CreatePromotionAsync(CreatePromotionRequest request)
    {
        var existing = await _promotionRepository.GetByCodeAsync(request.Code);
        if (existing != null)
            return ApiResponse<PromotionResponse>.ErrorResponse($"Code promo '{request.Code}' existe deja");

        var promotion = new Promotion
        {
            Code = request.Code.ToUpper(),
            Description = request.Description,
            DiscountType = request.DiscountType,
            DiscountValue = request.DiscountValue,
            MinAmount = request.MinAmount,
            MaxDiscount = request.MaxDiscount,
            ValidFrom = request.ValidFrom,
            ValidTo = request.ValidTo,
            MaxUses = request.MaxUses,
            MaxUsesPerUser = request.MaxUsesPerUser,
            IsActive = true
        };

        promotion = await _promotionRepository.CreateAsync(promotion);
        _logger.LogInformation("Promotion creee : {Code}", promotion.Code);

        return ApiResponse<PromotionResponse>.SuccessResponse(
            "Code promo cree", MapToResponse(promotion));
    }

    public async Task<ApiResponse<List<PromotionResponse>>> GetAllPromotionsAsync()
    {
        var promotions = await _promotionRepository.GetAllAsync();
        return ApiResponse<List<PromotionResponse>>.SuccessResponse(
            "Toutes les promotions", promotions.Select(MapToResponse).ToList());
    }

    public async Task<ApiResponse<List<PromotionResponse>>> GetActivePromotionsAsync()
    {
        var promotions = await _promotionRepository.GetActiveAsync();
        return ApiResponse<List<PromotionResponse>>.SuccessResponse(
            "Promotions actives", promotions.Select(MapToResponse).ToList());
    }

    public async Task<ApiResponse<ApplyPromoResponse>> ApplyPromoCodeAsync(ApplyPromoRequest request)
    {
        var promotion = await _promotionRepository.GetByCodeAsync(request.Code);
        if (promotion == null)
            return ApiResponse<ApplyPromoResponse>.ErrorResponse("Code promo invalide ou inactif");

        // Verifier la date de validite
        var now = DateTime.UtcNow;
        if (now < promotion.ValidFrom || now > promotion.ValidTo)
            return ApiResponse<ApplyPromoResponse>.ErrorResponse("Code promo expire");

        // Verifier le montant minimum
        if (request.CartAmount < promotion.MinAmount)
            return ApiResponse<ApplyPromoResponse>.ErrorResponse(
                $"Montant minimum requis : {promotion.MinAmount} EUR");

        // Verifier le nombre d utilisations max
        if (promotion.MaxUses > 0 && promotion.CurrentUses >= promotion.MaxUses)
            return ApiResponse<ApplyPromoResponse>.ErrorResponse("Code promo epuise");

        // Verifier utilisations par utilisateur
        if (!string.IsNullOrEmpty(request.UserId))
        {
            var userUsages = await _promotionRepository.GetUserUsageCountAsync(promotion.Id, request.UserId);
            if (userUsages >= promotion.MaxUsesPerUser)
                return ApiResponse<ApplyPromoResponse>.ErrorResponse(
                    "Vous avez deja utilise ce code promo");
        }

        // Calculer la remise
        var discountAmount = CalculateDiscount(promotion, request.CartAmount);
        var finalAmount = request.CartAmount - discountAmount;

        var description = promotion.DiscountType == DiscountType.Percentage
            ? $"{promotion.DiscountValue}% de remise"
            : $"{promotion.DiscountValue} EUR de remise";

        return ApiResponse<ApplyPromoResponse>.SuccessResponse(
            "Code promo valide",
            new ApplyPromoResponse
            {
                Code = promotion.Code,
                OriginalAmount = request.CartAmount,
                DiscountAmount = discountAmount,
                FinalAmount = finalAmount,
                DiscountDescription = description
            });
    }

    public async Task<ApiResponse<ApplyPromoResponse>> UsePromoCodeAsync(UsePromoRequest request)
    {
        var applyRequest = new ApplyPromoRequest
        {
            Code = request.Code,
            CartAmount = request.CartAmount,
            UserId = request.UserId
        };

        var applyResult = await ApplyPromoCodeAsync(applyRequest);
        if (!applyResult.Success)
            return ApiResponse<ApplyPromoResponse>.ErrorResponse(applyResult.Message);

        var promotion = await _promotionRepository.GetByCodeAsync(request.Code);

        // Enregistrer l utilisation
        await _promotionRepository.AddUsageAsync(new PromotionUsage
        {
            PromotionId = promotion!.Id,
            UserId = request.UserId,
            OrderId = request.OrderId,
            DiscountApplied = applyResult.Data!.DiscountAmount
        });

        // Incrementer le compteur
        promotion.CurrentUses++;
        await _promotionRepository.UpdateAsync(promotion);

        _logger.LogInformation("Code {Code} utilise par {UserId} pour commande {OrderId}",
            request.Code, request.UserId, request.OrderId);

        return applyResult;
    }

    public async Task<ApiResponse<bool>> DeactivatePromotionAsync(int id)
    {
        var promotion = await _promotionRepository.GetByIdAsync(id);
        if (promotion == null)
            return ApiResponse<bool>.ErrorResponse("Promotion introuvable");

        promotion.IsActive = false;
        await _promotionRepository.UpdateAsync(promotion);
        return ApiResponse<bool>.SuccessResponse("Promotion desactivee", true);
    }

    private decimal CalculateDiscount(Promotion promotion, decimal cartAmount)
    {
        decimal discount = promotion.DiscountType == DiscountType.Percentage
            ? cartAmount * (promotion.DiscountValue / 100)
            : promotion.DiscountValue;

        // Appliquer le plafond de remise si defini
        if (promotion.MaxDiscount.HasValue && discount > promotion.MaxDiscount.Value)
            discount = promotion.MaxDiscount.Value;

        // La remise ne peut pas depasser le montant total
        return Math.Min(discount, cartAmount);
    }

    private PromotionResponse MapToResponse(Promotion p) => new()
    {
        Id = p.Id,
        Code = p.Code,
        Description = p.Description,
        DiscountType = p.DiscountType.ToString(),
        DiscountValue = p.DiscountValue,
        MinAmount = p.MinAmount,
        MaxDiscount = p.MaxDiscount,
        ValidFrom = p.ValidFrom,
        ValidTo = p.ValidTo,
        MaxUses = p.MaxUses,
        MaxUsesPerUser = p.MaxUsesPerUser,
        CurrentUses = p.CurrentUses,
        IsActive = p.IsActive,
        CreatedAt = p.CreatedAt
    };
}