using System.ComponentModel.DataAnnotations;

namespace UserService.DTOs.Requests
{
    public class UpdateUserRequest
    {
        [MaxLength(255)]
        public string? Name { get; set; }

        [Phone]
        public string? Phone { get; set; }

        public string? University { get; set; }
        public string? StudentId { get; set; }
        public string? AcademicYear { get; set; }
        public string? Bio { get; set; }
        public DateTime? DateOfBirth { get; set; }
        public string? Address { get; set; }
        public string? City { get; set; }
        public string? Country { get; set; }
    }
}