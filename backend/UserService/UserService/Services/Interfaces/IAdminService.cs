using UserService.DTOs.Requests;
using UserService.DTOs.Responses;

namespace UserService.Services.Interfaces
{
    public interface IAdminService
    {
        Task<ApiResponse<bool>> ActivateAccountAsync(Guid userId);
        Task<ApiResponse<bool>> DeactivateAccountAsync(Guid userId);
        Task<ApiResponse<bool>> BlockUserAsync(Guid userId, BlockUserRequest request);
        Task<ApiResponse<bool>> UnblockUserAsync(Guid userId);
        Task<ApiResponse<bool>> DeleteUserAsync(Guid userId);
        Task<ApiResponse<bool>> DeleteUserByCredentialIdAsync(Guid credentialId);
        Task<ApiResponse<IEnumerable<UserResponse>>> GetAllUsersAsync();
        Task<ApiResponse<bool>> PromoteToAdminAsync(Guid userId);    
        Task<ApiResponse<bool>> DemoteFromAdminAsync(Guid userId);
    }
}