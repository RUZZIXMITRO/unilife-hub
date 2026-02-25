using Microsoft.EntityFrameworkCore;
using UserService.Data;
using UserService.Models;
using UserService.Repositories.Interfaces;

namespace UserService.Repositories.Implementations
{
    public class UserRepository : GenericRepository<User>, IUserRepository
    {
        public UserRepository(UserDbContext context) : base(context) { }

        public async Task<User?> GetByEmailAsync(string email)
        {
            return await _dbSet
                .Include(u => u.UserProfile)
                .Include(u => u.UserPreferences)
                .FirstOrDefaultAsync(u => u.Email == email);
        }

        public async Task<User?> GetByCredentialIdAsync(Guid credentialId)
        {
            return await _dbSet
                .Include(u => u.UserProfile)
                .Include(u => u.UserPreferences)
                .FirstOrDefaultAsync(u => u.CredentialId == credentialId);
        }

        public async Task<bool> EmailExistsAsync(string email)
        {
            return await _dbSet.AnyAsync(u => u.Email == email);
        }

        public async Task<IEnumerable<User>> SearchUsersAsync(string query)
        {
            return await _dbSet
                .Where(u => u.Name.Contains(query) || u.Email.Contains(query))
                .Include(u => u.UserProfile)
                .ToListAsync();
        }

        public async Task<IEnumerable<User>> GetUsersByStatusAsync(bool isActive)
        {
            return await _dbSet
                .Where(u => u.IsActive == isActive)
                .Include(u => u.UserProfile)
                .ToListAsync();
        }

        public async Task<User?> GetUserWithDetailsAsync(Guid id)
        {
            return await _dbSet
                .Include(u => u.UserProfile)
                .Include(u => u.UserPreferences)
                .FirstOrDefaultAsync(u => u.Id == id);
        }
    }
}