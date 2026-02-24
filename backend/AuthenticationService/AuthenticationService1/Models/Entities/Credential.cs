using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using AuthenticationService1.Models.Enums;

namespace AuthenticationService1.Models.Entities
{
    [Table("credentials", Schema = "dbo")]
    public class Credential
    {
        [Key]
        [Column("id")]
        public Guid Id { get; set; } = Guid.NewGuid();

        [Required]
        [EmailAddress]
        [MaxLength(255)]
        [Column("email")]
        public string Email { get; set; }

        [Required]
        [Column("password_hash")]
        public string PasswordHash { get; set; }

        public UserRole Role { get; set; } = UserRole.STUDENT;

        [Column("is_active")]
        public bool IsActive { get; set; } = false;

        [Column("created_at")]
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        [Column("updated_at")]
        public DateTime? UpdatedAt { get; set; }

        // Navigation
        public virtual ICollection<RefreshToken> RefreshTokens { get; set; }
        public virtual ICollection<PasswordReset> PasswordResets { get; set; }
    }
}