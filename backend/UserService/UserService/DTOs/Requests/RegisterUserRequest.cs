using System.ComponentModel.DataAnnotations;

namespace UserService.DTOs.Requests
{
    public class RegisterUserRequest
    {
        [Required]
        public Guid CredentialId { get; set; }

        [Required]
        [MaxLength(255)]
        public string Name { get; set; } = string.Empty;

        [Required]
        [EmailAddress]
        public string Email { get; set; } = string.Empty;

        [Phone]
        public string? Phone { get; set; }

        public string? University { get; set; }
        public string? StudentId { get; set; }
        public string? AcademicYear { get; set; }
        public string? Bio { get; set; }
    }
}