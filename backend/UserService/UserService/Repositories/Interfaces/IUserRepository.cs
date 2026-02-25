using UserService.Models;

namespace UserService.Repositories.Interfaces
{
    public interface IUserRepository : IGenericRepository<User>
    {
        Task<User?> GetByEmailAsync(string email);
        Task<User?> GetByCredentialIdAsync(Guid credentialId);

        Task<bool> EmailExistsAsync(string email);
        Task<IEnumerable<User>> SearchUsersAsync(string query);
        Task<IEnumerable<User>> GetUsersByStatusAsync(bool isActive);
        Task<User?> GetUserWithDetailsAsync(Guid id);
    }
}