using PromotionService.DTOs.Requests;
using PromotionService.DTOs.Responses;

namespace PromotionService.Services.Interfaces;

public interface IPromotionService
{
    Task<ApiResponse<PromotionResponse>> CreatePromotionAsync(CreatePromotionRequest request);
    Task<ApiResponse<List<PromotionResponse>>> GetAllPromotionsAsync();
    Task<ApiResponse<List<PromotionResponse>>> GetActivePromotionsAsync();
    Task<ApiResponse<ApplyPromoResponse>> ApplyPromoCodeAsync(ApplyPromoRequest request);
    Task<ApiResponse<ApplyPromoResponse>> UsePromoCodeAsync(UsePromoRequest request);
    Task<ApiResponse<bool>> DeactivatePromotionAsync(int id);
}