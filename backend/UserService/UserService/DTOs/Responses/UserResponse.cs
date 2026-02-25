using UserService.Models.Enums;

namespace UserService.DTOs.Responses
{
    public class UserResponse
    {
        public Guid Id { get; set; }
        public Guid CredentialId { get; set; }  

        public string Name { get; set; } = string.Empty;
        public string Email { get; set; } = string.Empty;
        public string? Phone { get; set; }
        public string? AvatarUrl { get; set; }
        public string? University { get; set; }
        public string? StudentId { get; set; }
        public string? AcademicYear { get; set; }
        public string? Bio { get; set; }
        public string Role { get; set; } = "STUDENT"; // ← STRING, pas enum
        public bool IsVerified { get; set; }
        public bool IsActive { get; set; }
        public bool IsBlocked { get; set; }
        public string? BlockedReason { get; set; }
        public DateTime? BlockedUntil { get; set; }
        public DateTime CreatedAt { get; set; }
        public DateTime? LastLogin { get; set; }

        // Relations
        public ProfileResponse? Profile { get; set; }
        public PreferencesResponse? Preferences { get; set; }
    }

    public class ProfileResponse
    {
        public DateTime? DateOfBirth { get; set; }
        public string? Address { get; set; }
        public string? City { get; set; }
        public string? Country { get; set; }
        public int Age { get; set; }
    }

    public class PreferencesResponse
    {
        public string Language { get; set; } = "fr";
        public string Timezone { get; set; } = "Africa/Casablanca";
        public bool EmailNotifications { get; set; } = true;
        public bool PushNotifications { get; set; } = true;
    }
}