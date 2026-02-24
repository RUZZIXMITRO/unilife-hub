using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace AuthenticationService1.Models.Entities
{
    [Table("refresh_tokens", Schema = "dbo")]
    public class RefreshToken
    {
        [Key]
        [Column("id")]
        public Guid Id { get; set; } = Guid.NewGuid();

        [Required]
        [Column("user_id")]
        public Guid UserId { get; set; }

        [Required]
        [Column("token")]
        public string Token { get; set; }

        [Required]
        [Column("expires_at")]
        public DateTime ExpiresAt { get; set; }

        [Column("created_at")]
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        [NotMapped]
        public bool IsExpired => DateTime.UtcNow >= ExpiresAt;

        [NotMapped]
        public bool IsValid => !IsExpired;

        [ForeignKey("UserId")]
        public virtual Credential User { get; set; }
    }
}