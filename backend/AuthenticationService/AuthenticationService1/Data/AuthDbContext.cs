using AuthenticationService1.Models.Entities;
using Microsoft.EntityFrameworkCore;

namespace AuthenticationService1.Data
{
    public class AuthDbContext : DbContext
    {
        public AuthDbContext(DbContextOptions<AuthDbContext> options) : base(options)
        {
        }

        public DbSet<Credential> Credentials { get; set; }
        public DbSet<RefreshToken> RefreshTokens { get; set; }
        public DbSet<TokenBlacklist> TokenBlacklist { get; set; }
        public DbSet<PasswordReset> PasswordResets { get; set; }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            // Index unique sur email
            modelBuilder.Entity<Credential>()
                .HasIndex(c => c.Email)
                .IsUnique();

            // Relation RefreshToken -> Credential
            modelBuilder.Entity<RefreshToken>()
                .HasOne(rt => rt.User)
                .WithMany(c => c.RefreshTokens)
                .HasForeignKey(rt => rt.UserId)
                .OnDelete(DeleteBehavior.Cascade);

            // Relation PasswordReset -> Credential
            modelBuilder.Entity<PasswordReset>()
                .HasOne(pr => pr.User)
                .WithMany(c => c.PasswordResets)
                .HasForeignKey(pr => pr.UserId)
                .OnDelete(DeleteBehavior.Cascade);
        }
    }
}