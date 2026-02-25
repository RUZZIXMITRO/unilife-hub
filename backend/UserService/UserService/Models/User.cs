using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using UserService.Models.Enums;

namespace UserService.Models
{
    [Table("users")]
    public class User
    {
        [Key]
        public Guid Id { get; set; } = Guid.NewGuid();

        public Guid CredentialId { get; set; }

        [Required]
        [MaxLength(255)]
        public string Name { get; set; } = string.Empty;

        [Required]
        [MaxLength(255)]
        public string Email { get; set; } = string.Empty;

        [MaxLength(20)]
        public string? Phone { get; set; }

        [MaxLength(500)]
        public string? AvatarUrl { get; set; }

        [MaxLength(255)]
        public string? University { get; set; }

        [MaxLength(50)]
        public string? StudentId { get; set; }

        [MaxLength(50)]
        public string? AcademicYear { get; set; }

        [MaxLength(1000)]
        public string? Bio { get; set; }

        public UserRole Role { get; set; } = UserRole.STUDENT;

        public bool IsVerified { get; set; } = false;

        public bool IsActive { get; set; } = true;

        public bool IsBlocked { get; set; } = false;

        [MaxLength(500)]
        public string? BlockedReason { get; set; }

        public DateTime? BlockedUntil { get; set; }

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        public DateTime? UpdatedAt { get; set; }

        public DateTime? LastLogin { get; set; }

        // Navigation properties
        public UserProfile? UserProfile { get; set; }
        public UserPreferences? UserPreferences { get; set; }

        // Méthodes
        public void Activate()
        {
            IsActive = true;
            UpdatedAt = DateTime.UtcNow;
        }

        public void Deactivate()
        {
            IsActive = false;
            UpdatedAt = DateTime.UtcNow;
        }

        public void Block(string reason, DateTime until)
        {
            IsBlocked = true;
            BlockedReason = reason;
            BlockedUntil = until;
            UpdatedAt = DateTime.UtcNow;
        }

        public void Unblock()
        {
            IsBlocked = false;
            BlockedReason = null;
            BlockedUntil = null;
            UpdatedAt = DateTime.UtcNow;
        }

        public bool CanLogin()
        {
            if (!IsActive) return false;
            if (IsBlocked && BlockedUntil > DateTime.UtcNow) return false;
            return true;
        }
    }
}