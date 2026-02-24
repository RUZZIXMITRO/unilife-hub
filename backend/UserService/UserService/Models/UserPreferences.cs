using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace UserService.Models
{
    [Table("user_preferences")]
    public class UserPreferences
    {
        [Key]
        public Guid Id { get; set; } = Guid.NewGuid();

        public Guid UserId { get; set; }

        [MaxLength(10)]
        public string Language { get; set; } = "fr";

        [MaxLength(50)]
        public string Timezone { get; set; } = "Africa/Casablanca";

        public bool EmailNotifications { get; set; } = true;

        public bool PushNotifications { get; set; } = true;

        [ForeignKey("UserId")]
        public User User { get; set; } = null!;
    }
}