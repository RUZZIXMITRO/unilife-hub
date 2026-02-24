using Microsoft.EntityFrameworkCore;
using UserService.Data;
using UserService.DTOs.Requests;
using UserService.DTOs.Responses;
using UserService.Models;
using UserService.Repositories.Interfaces;
using UserService.Services.Interfaces;

namespace UserService.Services.Implementations
{
    public class UserServiceImpl : IUserService
    {
        private readonly IUserRepository _userRepository;
        private readonly UserDbContext _context;
        private readonly ILogger<UserServiceImpl> _logger;

        public UserServiceImpl(
            IUserRepository userRepository,
            UserDbContext context,
            ILogger<UserServiceImpl> logger)
        {
            _userRepository = userRepository;
            _context = context;
            _logger = logger;
        }

        public async Task<ApiResponse<UserResponse>> RegisterUserAsync(RegisterUserRequest request)
        {
            try
            {
                // Vérifier si l'email existe déjà
                if (await _userRepository.EmailExistsAsync(request.Email))
                {
                    return ApiResponse<UserResponse>.ErrorResponse("Cet email est déjà utilisé");
                }

                // Créer l'utilisateur
                var user = new User
                {
                    CredentialId = request.CredentialId,
                    Name = request.Name,
                    Email = request.Email,
                    Phone = request.Phone,
                    University = request.University,
                    StudentId = request.StudentId,
                    AcademicYear = request.AcademicYear,
                    Bio = request.Bio
                };

                await _userRepository.AddAsync(user);

                // Créer le profil
                var profile = new UserProfile { UserId = user.Id };
                await _context.UserProfiles.AddAsync(profile);

                // Créer les préférences
                var preferences = new UserPreferences { UserId = user.Id };
                await _context.UserPreferences.AddAsync(preferences);

                await _context.SaveChangesAsync();

                _logger.LogInformation($"Utilisateur créé : {user.Email}");

                return ApiResponse<UserResponse>.SuccessResponse(
                    "Utilisateur créé avec succès",
                    MapToUserResponse(user));
            }
            catch (Exception ex)
            {
                _logger.LogError($"Erreur lors de la création de l'utilisateur : {ex.Message}");
                return ApiResponse<UserResponse>.ErrorResponse("Erreur lors de la création de l'utilisateur");
            }
        }

        public async Task<ApiResponse<UserResponse>> GetUserByIdAsync(Guid id)
        {
            var user = await _userRepository.GetUserWithDetailsAsync(id);
            if (user == null)
            {
                return ApiResponse<UserResponse>.ErrorResponse("Utilisateur introuvable");
            }

            return ApiResponse<UserResponse>.SuccessResponse("Utilisateur trouvé", MapToUserResponse(user));
        }

        public async Task<ApiResponse<UserResponse>> GetUserByCredentialIdAsync(Guid credentialId)
        {
            try
            {
                var user = await _userRepository.GetByCredentialIdAsync(credentialId);

                if (user == null)
                {
                    return new ApiResponse<UserResponse>
                    {
                        Success = false,
                        Message = "Utilisateur non trouvé",
                        Data = null,
                        Errors = new List<string> { "Aucun utilisateur avec ce credentialId" }
                    };
                }

                // Charger les relations (Profile et Preferences)
                var userWithDetails = await _userRepository.GetUserWithDetailsAsync(user.Id);

                if (userWithDetails == null)
                {
                    return new ApiResponse<UserResponse>
                    {
                        Success = false,
                        Message = "Erreur lors du chargement des détails",
                        Data = null,
                        Errors = new List<string> { "Impossible de charger les détails de l'utilisateur" }
                    };
                }

                // Mapper vers UserResponse en utilisant la méthode helper
                var userResponse = MapToUserResponse(userWithDetails);

                return new ApiResponse<UserResponse>
                {
                    Success = true,
                    Message = "Utilisateur trouvé",
                    Data = userResponse,
                    Errors = new List<string>()
                };
            }
            catch (Exception ex)
            {
                _logger.LogError($"Erreur lors de la récupération du profil par credentialId : {ex.Message}");
                return new ApiResponse<UserResponse>
                {
                    Success = false,
                    Message = "Erreur lors de la récupération du profil",
                    Data = null,
                    Errors = new List<string> { ex.Message }
                };
            }
        }

        public async Task<ApiResponse<UserResponse>> GetUserByEmailAsync(string email)
        {
            var user = await _userRepository.GetByEmailAsync(email);
            if (user == null)
            {
                return ApiResponse<UserResponse>.ErrorResponse("Utilisateur introuvable");
            }

            return ApiResponse<UserResponse>.SuccessResponse("Utilisateur trouvé", MapToUserResponse(user));
        }

        public async Task<ApiResponse<UserResponse>> UpdateUserAsync(Guid id, UpdateUserRequest request)
        {
            var user = await _userRepository.GetUserWithDetailsAsync(id);
            if (user == null)
            {
                return ApiResponse<UserResponse>.ErrorResponse("Utilisateur introuvable");
            }

            // Mise à jour User
            if (!string.IsNullOrEmpty(request.Name)) user.Name = request.Name;
            if (!string.IsNullOrEmpty(request.Phone)) user.Phone = request.Phone;
            if (!string.IsNullOrEmpty(request.University)) user.University = request.University;
            if (!string.IsNullOrEmpty(request.StudentId)) user.StudentId = request.StudentId;
            if (!string.IsNullOrEmpty(request.AcademicYear)) user.AcademicYear = request.AcademicYear;
            if (!string.IsNullOrEmpty(request.Bio)) user.Bio = request.Bio;
            user.UpdatedAt = DateTime.UtcNow;

            // Mise à jour Profile
            if (user.UserProfile != null)
            {
                if (request.DateOfBirth.HasValue) user.UserProfile.DateOfBirth = request.DateOfBirth;
                if (!string.IsNullOrEmpty(request.Address)) user.UserProfile.Address = request.Address;
                if (!string.IsNullOrEmpty(request.City)) user.UserProfile.City = request.City;
                if (!string.IsNullOrEmpty(request.Country)) user.UserProfile.Country = request.Country;
            }

            await _userRepository.UpdateAsync(user);

            _logger.LogInformation($"Utilisateur mis à jour : {user.Email}");

            return ApiResponse<UserResponse>.SuccessResponse(
                "Utilisateur mis à jour avec succès",
                MapToUserResponse(user));
        }

        public async Task<ApiResponse<bool>> DeleteUserAsync(Guid id)
        {
            var user = await _userRepository.GetByIdAsync(id);
            if (user == null)
            {
                return ApiResponse<bool>.ErrorResponse("Utilisateur introuvable");
            }

            await _userRepository.DeleteAsync(user);
            _logger.LogInformation($"Utilisateur supprimé : {user.Email}");

            return ApiResponse<bool>.SuccessResponse("Utilisateur supprimé avec succès", true);
        }

        public async Task<ApiResponse<IEnumerable<UserResponse>>> GetAllUsersAsync()
        {
            var users = await _userRepository.GetAllAsync();
            var response = users.Select(MapToUserResponse);
            return ApiResponse<IEnumerable<UserResponse>>.SuccessResponse(
                $"{users.Count()} utilisateurs trouvés",
                response);
        }

        public async Task<ApiResponse<IEnumerable<UserResponse>>> SearchUsersAsync(string query)
        {
            var users = await _userRepository.SearchUsersAsync(query);
            var response = users.Select(MapToUserResponse);
            return ApiResponse<IEnumerable<UserResponse>>.SuccessResponse(
                $"{users.Count()} utilisateurs trouvés",
                response);
        }

        public async Task<ApiResponse<IEnumerable<UserResponse>>> GetUsersByStatusAsync(bool isActive)
        {
            var users = await _userRepository.GetUsersByStatusAsync(isActive);
            var response = users.Select(MapToUserResponse);
            return ApiResponse<IEnumerable<UserResponse>>.SuccessResponse(
                $"{users.Count()} utilisateurs trouvés",
                response);
        }

        // ==================== HELPER METHOD UNIFIÉ ====================
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
                Role = user.Role.ToString(), // ← Convertit enum en string
                IsVerified = user.IsVerified,
                IsActive = user.IsActive,
                IsBlocked = user.IsBlocked,
                BlockedReason = user.BlockedReason,
                BlockedUntil = user.BlockedUntil,
                CreatedAt = user.CreatedAt,
                LastLogin = user.LastLogin,
                Profile = user.UserProfile != null ? new ProfileResponse
                {
                    DateOfBirth = user.UserProfile.DateOfBirth,
                    Address = user.UserProfile.Address,
                    City = user.UserProfile.City,
                    Country = user.UserProfile.Country,
                    Age = user.UserProfile.GetAge()
                } : null,
                Preferences = user.UserPreferences != null ? new PreferencesResponse
                {
                    Language = user.UserPreferences.Language,
                    Timezone = user.UserPreferences.Timezone,
                    EmailNotifications = user.UserPreferences.EmailNotifications,
                    PushNotifications = user.UserPreferences.PushNotifications
                } : null
            };
        }
        public async Task<ApiResponse<UserResponse>> BlockUserAsync(Guid userId, string reason, DateTime? blockedUntil)
        {
            try
            {
                var user = await _context.Users.FindAsync(userId);

                if (user == null)
                    return ApiResponse<UserResponse>.ErrorResponse("Utilisateur introuvable");

                user.Block(reason, blockedUntil ?? DateTime.UtcNow.AddDays(30));
                await _context.SaveChangesAsync();

                return ApiResponse<UserResponse>.SuccessResponse(
                    $"Utilisateur bloqué jusqu'au {user.BlockedUntil?.ToString("dd/MM/yyyy")}",
                    null
                );
            }
            catch (Exception ex)
            {
                return ApiResponse<UserResponse>.ErrorResponse(ex.Message);
            }
        }

        public async Task<ApiResponse<UserResponse>> UnblockUserAsync(Guid userId)
        {
            try
            {
                var user = await _context.Users.FindAsync(userId);

                if (user == null)
                    return ApiResponse<UserResponse>.ErrorResponse("Utilisateur introuvable");

                user.Unblock();
                await _context.SaveChangesAsync();

                return ApiResponse<UserResponse>.SuccessResponse(
                    "Utilisateur débloqué avec succès",
                    null
                );
            }
            catch (Exception ex)
            {
                return ApiResponse<UserResponse>.ErrorResponse(ex.Message);
            }
        }

        public async Task<ApiResponse<bool>> DeleteUserByCredentialIdAsync(Guid credentialId)
        {
            try
            {
                var user = await _context.Users
                    .FirstOrDefaultAsync(u => u.CredentialId == credentialId);

                if (user == null)
                    return ApiResponse<bool>.ErrorResponse("Utilisateur introuvable");

                _context.Users.Remove(user);
                await _context.SaveChangesAsync();

                return ApiResponse<bool>.SuccessResponse("Utilisateur supprimé", true);
            }
            catch (Exception ex)
            {
                return ApiResponse<bool>.ErrorResponse(ex.Message);
            }
        }
    }
}