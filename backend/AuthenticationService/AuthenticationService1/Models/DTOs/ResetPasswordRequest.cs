using System.ComponentModel.DataAnnotations;

namespace AuthenticationService1.Models.DTOs
{
    public class ResetPasswordRequest
    {
        [Required]
        public string Token { get; set; }

        [Required]
        [MinLength(8)]
        public string NewPassword { get; set; }

        [Required]
        [Compare("NewPassword")]
        public string ConfirmPassword { get; set; }
    }
}