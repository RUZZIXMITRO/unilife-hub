using Microsoft.EntityFrameworkCore;
using PromotionService.Data;
using PromotionService.Models;
using PromotionService.Repositories.Interfaces;

namespace PromotionService.Repositories.Implementations;

public class PromotionRepository : IPromotionRepository
{
    private readonly PromotionDbContext _context;

    public PromotionRepository(PromotionDbContext context) { _context = context; }

    public async Task<Promotion?> GetByCodeAsync(string code) =>
        await _context.Promotions.FirstOrDefaultAsync(p =>
            p.Code.ToUpper() == code.ToUpper() && p.IsActive);

    public async Task<Promotion?> GetByIdAsync(int id) =>
        await _context.Promotions.Include(p => p.Usages).FirstOrDefaultAsync(p => p.Id == id);

    public async Task<List<Promotion>> GetAllAsync() =>
        await _context.Promotions.OrderByDescending(p => p.CreatedAt).ToListAsync();

    public async Task<List<Promotion>> GetActiveAsync() =>
        await _context.Promotions
            .Where(p => p.IsActive && p.ValidFrom <= DateTime.UtcNow && p.ValidTo >= DateTime.UtcNow)
            .ToListAsync();

    public async Task<Promotion> CreateAsync(Promotion promotion)
    {
        _context.Promotions.Add(promotion);
        await _context.SaveChangesAsync();
        return promotion;
    }

    public async Task<Promotion> UpdateAsync(Promotion promotion)
    {
        promotion.UpdatedAt = DateTime.UtcNow;
        _context.Promotions.Update(promotion);
        await _context.SaveChangesAsync();
        return promotion;
    }

    public async Task<int> GetUserUsageCountAsync(int promotionId, string userId) =>
        await _context.PromotionUsages
            .CountAsync(u => u.PromotionId == promotionId && u.UserId == userId);

    public async Task<PromotionUsage> AddUsageAsync(PromotionUsage usage)
    {
        _context.PromotionUsages.Add(usage);
        await _context.SaveChangesAsync();
        return usage;
    }
}