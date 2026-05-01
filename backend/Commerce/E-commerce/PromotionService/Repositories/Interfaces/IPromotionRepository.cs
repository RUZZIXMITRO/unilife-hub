using PromotionService.Models;

namespace PromotionService.Repositories.Interfaces;

public interface IPromotionRepository
{
    Task<Promotion?> GetByCodeAsync(string code);
    Task<Promotion?> GetByIdAsync(int id);
    Task<List<Promotion>> GetAllAsync();
    Task<List<Promotion>> GetActiveAsync();
    Task<Promotion> CreateAsync(Promotion promotion);
    Task<Promotion> UpdateAsync(Promotion promotion);
    Task<int> GetUserUsageCountAsync(int promotionId, string userId);
    Task<PromotionUsage> AddUsageAsync(PromotionUsage usage);
}