using System.ComponentModel.DataAnnotations;

namespace AuthenticationService1.Models.DTOs
{
    public class ChangePasswordRequest
    {
        [Required(ErrorMessage = "L'ancien mot de passe est requis")]
        public string CurrentPassword { get; set; } = string.Empty;

        [Required(ErrorMessage = "Le nouveau mot de passe est requis")]
        [MinLength(6, ErrorMessage = "Le mot de passe doit contenir au moins 6 caractères")]
        public string NewPassword { get; set; } = string.Empty;

        [Required(ErrorMessage = "La confirmation est requise")]
        [Compare("NewPassword", ErrorMessage = "Les mots de passe ne correspondent pas")]
        public string ConfirmNewPassword { get; set; } = string.Empty;
    }
}
