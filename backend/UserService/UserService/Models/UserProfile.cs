using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace UserService.Models
{
    [Table("user_profiles")]
    public class UserProfile
    {
        [Key]
        public Guid Id { get; set; } = Guid.NewGuid();

        public Guid UserId { get; set; }

        public DateTime? DateOfBirth { get; set; }

        [MaxLength(255)]
        public string? Address { get; set; }

        [MaxLength(100)]
        public string? City { get; set; }

        [MaxLength(100)]
        public string? Country { get; set; }

        [ForeignKey("UserId")]
        public User User { get; set; } = null!;

        public int GetAge()
        {
            if (!DateOfBirth.HasValue) return 0;
            var age = DateTime.Today.Year - DateOfBirth.Value.Year;
            if (DateOfBirth.Value.Date > DateTime.Today.AddYears(-age)) age--;
            return age;
        }
    }
}