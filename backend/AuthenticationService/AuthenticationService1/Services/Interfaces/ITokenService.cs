using AuthenticationService1.Models.Entities;

namespace AuthenticationService1.Services.Interfaces
{
    public interface ITokenService
    {
        string GenerateAccessToken(Credential user);
        string GenerateRefreshToken();
        bool ValidateToken(string token);
        Guid? GetUserIdFromToken(string token);

    }
}