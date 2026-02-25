using UserService.DTOs.Requests;
using UserService.DTOs.Responses;
using UserService.Models;
using UserService.Repositories.Interfaces;
using UserService.Services.Interfaces;

namespace UserService.Services.Implementations
{
    public class AdminServiceImpl : IAdminService
    {
        private readonly IUserRepository _userRepository;
        private readonly ILogger<AdminServiceImpl> _logger;

        public AdminServiceImpl(IUserRepository userRepository, ILogger<AdminServiceImpl> logger)
        {
            _userRepository = userRepository;
            _logger = logger;
        }

        // ✅ DÉJÀ EXISTANT
        public async Task<ApiResponse<bool>> ActivateAccountAsync(Guid userId)
        {
            var user = await _userRepository.GetByIdAsync(userId);
            if (user == null)
                return ApiResponse<bool>.ErrorResponse("Utilisateur introuvable");

            user.Activate();
            await _userRepository.UpdateAsync(user);

            _logger.LogInformation($"Compte activé : {user.Email}");
            return ApiResponse<bool>.SuccessResponse("Compte activé avec succès", true);
        }

        // ✅ DÉJÀ EXISTANT
        public async Task<ApiResponse<bool>> DeactivateAccountAsync(Guid userId)
        {
            var user = await _userRepository.GetByIdAsync(userId);
            if (user == null)
                return ApiResponse<bool>.ErrorResponse("Utilisateur introuvable");

            user.Deactivate();
            await _userRepository.UpdateAsync(user);

            _logger.LogInformation($"Compte désactivé : {user.Email}");
            return ApiResponse<bool>.SuccessResponse("Compte désactivé avec succès", true);
        }

        // ✅ DÉJÀ EXISTANT - BlockUserRequest utilise .Until
        public async Task<ApiResponse<bool>> BlockUserAsync(Guid userId, BlockUserRequest request)
        {
            var user = await _userRepository.GetByIdAsync(userId);
            if (user == null)
                return ApiResponse<bool>.ErrorResponse("Utilisateur introuvable");

            user.Block(request.Reason, request.Until);
            await _userRepository.UpdateAsync(user);

            _logger.LogInformation($"Utilisateur bloqué : {user.Email}");
            return ApiResponse<bool>.SuccessResponse("Utilisateur bloqué avec succès", true);
        }

        // ✅ DÉJÀ EXISTANT
        public async Task<ApiResponse<bool>> UnblockUserAsync(Guid userId)
        {
            var user = await _userRepository.GetByIdAsync(userId);
            if (user == null)
                return ApiResponse<bool>.ErrorResponse("Utilisateur introuvable");

            user.Unblock();
            await _userRepository.UpdateAsync(user);

            _logger.LogInformation($"Utilisateur débloqué : {user.Email}");
            return ApiResponse<bool>.SuccessResponse("Utilisateur débloqué avec succès", true);
        }

        // ✅ CORRIGÉ - DeleteAsync prend l'entité
        public async Task<ApiResponse<bool>> DeleteUserAsync(Guid userId)
        {
            try
            {
                var user = await _userRepository.GetByIdAsync(userId);

                if (user == null)
                    return ApiResponse<bool>.ErrorResponse("Utilisateur introuvable");

                await _userRepository.DeleteAsync(user);  // ✅ Passer l'entité

                _logger.LogInformation($"Utilisateur supprimé : {userId}");
                return ApiResponse<bool>.SuccessResponse("Utilisateur supprimé avec succès", true);
            }
            catch (Exception ex)
            {
                _logger.LogError($"Erreur suppression : {ex.Message}");
                return ApiResponse<bool>.ErrorResponse(ex.Message);
            }
        }

        // ✅ CORRIGÉ - DeleteAsync prend l'entité
        public async Task<ApiResponse<bool>> DeleteUserByCredentialIdAsync(Guid credentialId)
        {
            try
            {
                var user = await _userRepository.GetByCredentialIdAsync(credentialId);

                if (user == null)
                    return ApiResponse<bool>.ErrorResponse("Utilisateur introuvable");

                await _userRepository.DeleteAsync(user);  // ✅ Passer l'entité

                _logger.LogInformation($"Utilisateur supprimé par credentialId : {credentialId}");
                return ApiResponse<bool>.SuccessResponse("Utilisateur supprimé avec succès", true);
            }
            catch (Exception ex)
            {
                _logger.LogError($"Erreur suppression : {ex.Message}");
                return ApiResponse<bool>.ErrorResponse(ex.Message);
            }
        }

        // ✅ CORRIGÉ - Utilise _userRepository
        public async Task<ApiResponse<IEnumerable<UserResponse>>> GetAllUsersAsync()
        {
            try
            {
                var users = await _userRepository.GetAllAsync();
                var response = users.Select(MapToUserResponse);

                return ApiResponse<IEnumerable<UserResponse>>.SuccessResponse(
                    $"{users.Count()} utilisateurs trouvés",
                    response
                );
            }
            catch (Exception ex)
            {
                _logger.LogError($"Erreur récupération users : {ex.Message}");
                return ApiResponse<IEnumerable<UserResponse>>.ErrorResponse(ex.Message);
            }
        }

        // ✅ HELPER : Mapper User → UserResponse
        private UserResponse MapToUserResponse(User user)
        {
            return new UserResponse
            {
                Id = user.Id,
                CredentialId = user.CredentialId,
                Name = user.Name,
                Email = user.Email,
                Phone = user.Phone,
                AvatarUrl = user.AvatarUrl,
                University = user.University,
                StudentId = user.StudentId,
                AcademicYear = user.AcademicYear,
                Bio = user.Bio,
                Role = user.Role.ToString(),
                IsVerified = user.IsVerified,
                IsActive = user.IsActive,
                IsBlocked = user.IsBlocked,
                BlockedReason = user.BlockedReason,
                BlockedUntil = user.BlockedUntil,
                CreatedAt = user.CreatedAt,
                LastLogin = user.LastLogin
            };
        }

        // ✅ Promouvoir en Admin
        public async Task<ApiResponse<bool>> PromoteToAdminAsync(Guid userId)
        {
            try
            {
                var user = await _userRepository.GetByIdAsync(userId);

                if (user == null)
                    return ApiResponse<bool>.ErrorResponse("Utilisateur introuvable");

                user.Role = UserService.Models.Enums.UserRole.ADMIN;
                user.UpdatedAt = DateTime.UtcNow;
                await _userRepository.UpdateAsync(user);

                _logger.LogInformation($"Utilisateur promu Admin : {user.Email}");
                return ApiResponse<bool>.SuccessResponse("Utilisateur promu Administrateur avec succès", true);
            }
            catch (Exception ex)
            {
                _logger.LogError($"Erreur promotion : {ex.Message}");
                return ApiResponse<bool>.ErrorResponse(ex.Message);
            }
        }

        // ✅ Rétrograder en Student
        public async Task<ApiResponse<bool>> DemoteFromAdminAsync(Guid userId)
        {
            try
            {
                var user = await _userRepository.GetByIdAsync(userId);

                if (user == null)
                    return ApiResponse<bool>.ErrorResponse("Utilisateur introuvable");

                user.Role = UserService.Models.Enums.UserRole.STUDENT;
                user.UpdatedAt = DateTime.UtcNow;
                await _userRepository.UpdateAsync(user);

                _logger.LogInformation($"Utilisateur rétrogradé Student : {user.Email}");
                return ApiResponse<bool>.SuccessResponse("Utilisateur rétrogradé Étudiant avec succès", true);
            }
            catch (Exception ex)
            {
                _logger.LogError($"Erreur rétrogradation : {ex.Message}");
                return ApiResponse<bool>.ErrorResponse(ex.Message);
            }
        }
    }
}