using Microsoft.EntityFrameworkCore;
using PromotionService.Models;

namespace PromotionService.Data;

public class PromotionDbContext : DbContext
{
    public PromotionDbContext(DbContextOptions<PromotionDbContext> options) : base(options) { }

    public DbSet<Promotion> Promotions => Set<Promotion>();
    public DbSet<PromotionUsage> PromotionUsages => Set<PromotionUsage>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.Entity<Promotion>()
            .HasIndex(p => p.Code)
            .IsUnique();

        modelBuilder.Entity<Promotion>()
            .HasMany(p => p.Usages)
            .WithOne(u => u.Promotion)
            .HasForeignKey(u => u.PromotionId)
            .OnDelete(DeleteBehavior.Cascade);
    }
}