using AuthenticationService1.Models.DTOs;

namespace AuthenticationService1.Services.Interfaces
{
    public interface IAuthService
    {
        Task<ApiResponse<AuthResponse>> RegisterAsync(RegisterRequest request);
        Task<ApiResponse<AuthResponse>> LoginAsync(LoginRequest request);
        Task<ApiResponse<AuthResponse>> RefreshTokenAsync(RefreshTokenRequest request);
        Task<ApiResponse<string>> LogoutAsync(string token);
        Task<ApiResponse<string>> RequestPasswordResetAsync(RequestPasswordResetRequest request);
        Task<ApiResponse<string>> ResetPasswordAsync(ResetPasswordRequest request);
        Task<ApiResponse<bool>> ChangePasswordAsync(string userId, ChangePasswordRequest request); 
        Task<ApiResponse<string>> DeleteAccountAsync(string userId);


    }
}