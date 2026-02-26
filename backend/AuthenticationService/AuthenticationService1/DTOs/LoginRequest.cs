using System.ComponentModel.DataAnnotations;

namespace AuthenticationService1.DTOs
{
    public class LoginRequest
    {
        [Required(ErrorMessage = "L'email est requis")]
        [EmailAddress(ErrorMessage = "Email invalide")]
        public string Email { get; set; }

        [Required(ErrorMessage = "Le mot de passe est requis")]
        public string Password { get; set; }
    }
}