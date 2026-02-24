using AuthenticationService1.Data;
using AuthenticationService1.Models.Entities;
using AuthenticationService1.Repositories.Interfaces;

using Microsoft.EntityFrameworkCore;

namespace AuthenticationService1.Repositories
{
    public class CredentialRepository : GenericRepository<Credential>, ICredentialRepository
    {
        public CredentialRepository(AuthDbContext context) : base(context)
        {
        }

        public async Task<Credential> GetByEmailAsync(string email)
        {
            return await _dbSet
                .Include(c => c.RefreshTokens)
                .FirstOrDefaultAsync(c => c.Email == email);
        }

        public async Task<bool> EmailExistsAsync(string email)
        {
            return await _dbSet.AnyAsync(c => c.Email == email);
        }
    }
}