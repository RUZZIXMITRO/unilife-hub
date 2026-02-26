using System.ComponentModel.DataAnnotations;

namespace AuthenticationService1.DTOs
{
    public class RegisterRequest
    {
        [Required(ErrorMessage = "L'email est requis")]
        [EmailAddress(ErrorMessage = "Email invalide")]
        public string Email { get; set; }

        [Required(ErrorMessage = "Le mot de passe est requis")]
        [MinLength(8, ErrorMessage = "Minimum 8 caractères")]
        public string Password { get; set; }

        [Required]
        [Compare("Password", ErrorMessage = "Les mots de passe ne correspondent pas")]
        public string ConfirmPassword { get; set; }
    }
}