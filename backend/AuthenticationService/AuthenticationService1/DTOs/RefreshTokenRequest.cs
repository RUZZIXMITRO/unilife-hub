using System.ComponentModel.DataAnnotations;

namespace AuthenticationService1.DTOs
{
    public class RefreshTokenRequest
    {
        [Required]
        public string RefreshToken { get; set; }
    }
}