using System.ComponentModel.DataAnnotations;

namespace UserService.DTOs.Requests
{
    public class BlockUserRequest
    {
        [Required]
        [MaxLength(500)]
        public string Reason { get; set; } = string.Empty;

        [Required]
        public DateTime Until { get; set; }
    }
}