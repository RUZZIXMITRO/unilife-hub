using System.ComponentModel.DataAnnotations;

namespace AuthenticationService1.Models.DTOs
{
    public class RequestPasswordResetRequest
    {
        [Required]
        [EmailAddress]
        public string Email { get; set; }
    }
}