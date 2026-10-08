using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace AuthenticationService1.Models.Entities
{
    [Table("token_blacklist", Schema = "dbo")]
    public class TokenBlacklist
    {
        [Key]
        [Column("id")]
        public Guid Id { get; set; } = Guid.NewGuid();

        [Required]
        [Column("token")]
        public string Token { get; set; }

        [Column("blacklisted_at")]
        public DateTime BlacklistedAt { get; set; } = DateTime.UtcNow;
    }
}