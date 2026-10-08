using UserService.DTOs.Requests;
using UserService.DTOs.Responses;

namespace UserService.Services.Interfaces
{
    public interface IUserService
    {
        Task<ApiResponse<UserResponse>> RegisterUserAsync(RegisterUserRequest request);
        Task<ApiResponse<UserResponse>> GetUserByIdAsync(Guid id);
        Task<ApiResponse<UserResponse>> GetUserByEmailAsync(string email);
        Task<ApiResponse<UserResponse>> GetUserByCredentialIdAsync(Guid credentialId); // ← AJOUTER

        Task<ApiResponse<UserResponse>> UpdateUserAsync(Guid id, UpdateUserRequest request);
        Task<ApiResponse<bool>> DeleteUserAsync(Guid id);
        Task<ApiResponse<IEnumerable<UserResponse>>> GetAllUsersAsync();
        Task<ApiResponse<IEnumerable<UserResponse>>> SearchUsersAsync(string query);
        Task<ApiResponse<IEnumerable<UserResponse>>> GetUsersByStatusAsync(bool isActive);
        Task<ApiResponse<UserResponse>> BlockUserAsync(Guid userId, string reason, DateTime? blockedUntil);
        Task<ApiResponse<UserResponse>> UnblockUserAsync(Guid userId);
        Task<ApiResponse<bool>> DeleteUserByCredentialIdAsync(Guid credentialId);
    }
}