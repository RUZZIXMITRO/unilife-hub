using AuthenticationService1.Models.Entities;
using AuthenticationService1.Repositories.Interfaces;

namespace AuthenticationService1.Repositories.Interfaces
{
    public interface ICredentialRepository : IGenericRepository<Credential>
    {
        Task<Credential> GetByEmailAsync(string email);
        Task<bool> EmailExistsAsync(string email);
    }
}