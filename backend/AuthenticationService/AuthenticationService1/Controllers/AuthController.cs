
using AuthenticationService1.Data;
using AuthenticationService1.DTOs;
using AuthenticationService1.Enums;
using AuthenticationService1.Services.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;


namespace AuthenticationService1.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class AuthController : ControllerBase
    {
        private readonly IAuthService _authService;
        private readonly AuthDbContext _context;

        public AuthController(IAuthService authService, AuthDbContext context)
        {
            _authService = authService;
            _context = context;

        }

        [HttpPost("register")]
        [ProducesResponseType(typeof(ApiResponse<AuthResponse>), 200)]
        [ProducesResponseType(typeof(ApiResponse<AuthResponse>), 400)]
        public async Task<IActionResult> Register([FromBody] RegisterRequest request)
        {
            if (!ModelState.IsValid)
            {
                var errors = ModelState.Values
                    .SelectMany(v => v.Errors)
                    .Select(e => e.ErrorMessage)
                    .ToList();

                return BadRequest(ApiResponse<AuthResponse>.ErrorResponse(
                    "Validation échouée",
                    errors
                ));
            }

            var result = await _authService.RegisterAsync(request);

            if (!result.Success)
            {
                return BadRequest(result);
            }

            return Ok(result);
        }

        [HttpPost("login")]
        [ProducesResponseType(typeof(ApiResponse<AuthResponse>), 200)]
        [ProducesResponseType(typeof(ApiResponse<AuthResponse>), 400)]
        public async Task<IActionResult> Login([FromBody] LoginRequest request)
        {
            if (!ModelState.IsValid)
            {
                var errors = ModelState.Values
                    .SelectMany(v => v.Errors)
                    .Select(e => e.ErrorMessage)
                    .ToList();

                return BadRequest(ApiResponse<AuthResponse>.ErrorResponse(
                    "Validation échouée",
                    errors
                ));
            }

            var result = await _authService.LoginAsync(request);

            if (!result.Success)
            {
                return BadRequest(result);
            }

            return Ok(result);
        }

        [HttpPost("refresh-token")]
        [ProducesResponseType(typeof(ApiResponse<AuthResponse>), 200)]
        [ProducesResponseType(typeof(ApiResponse<AuthResponse>), 400)]
        public async Task<IActionResult> RefreshToken([FromBody] RefreshTokenRequest request)
        {
            var result = await _authService.RefreshTokenAsync(request);

            if (!result.Success)
            {
                return BadRequest(result);
            }

            return Ok(result);
        }

        [HttpPost("logout")]
        [Authorize]
        [ProducesResponseType(typeof(ApiResponse<string>), 200)]
        public async Task<IActionResult> Logout()
        {
            var token = Request.Headers["Authorization"].ToString().Replace("Bearer ", "");
            var result = await _authService.LogoutAsync(token);

            return Ok(result);
        }

        [HttpPost("request-password-reset")]
        [ProducesResponseType(typeof(ApiResponse<string>), 200)]
        public async Task<IActionResult> RequestPasswordReset([FromBody] RequestPasswordResetRequest request)
        {
            var result = await _authService.RequestPasswordResetAsync(request);
            return Ok(result);
        }

        [HttpPost("reset-password")]
        [ProducesResponseType(typeof(ApiResponse<string>), 200)]
        [ProducesResponseType(typeof(ApiResponse<string>), 400)]
        public async Task<IActionResult> ResetPassword([FromBody] ResetPasswordRequest request)
        {
            if (!ModelState.IsValid)
            {
                var errors = ModelState.Values
                    .SelectMany(v => v.Errors)
                    .Select(e => e.ErrorMessage)
                    .ToList();

                return BadRequest(ApiResponse<string>.ErrorResponse(
                    "Validation échouée",
                    errors
                ));
            }

            var result = await _authService.ResetPasswordAsync(request);

            if (!result.Success)
            {
                return BadRequest(result);
            }

            return Ok(result);
        }

        [HttpGet("me")]
        [Authorize]
        [ProducesResponseType(200)]
        public IActionResult GetCurrentUser()
        {
            var userId = User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value;
            var email = User.FindFirst(System.Security.Claims.ClaimTypes.Email)?.Value;

            return Ok(new
            {
                userId,
                email,
                message = "Vous êtes authentifié !"
            });
        }

        [HttpPost("change-password")]
        [Authorize]
        public async Task<IActionResult> ChangePassword([FromBody] ChangePasswordRequest request)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            // Récupérer l'ID de l'utilisateur depuis le token JWT
            var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;

            if (string.IsNullOrEmpty(userId))
                return Unauthorized(new ApiResponse<bool>
                {
                    Success = false,
                    Message = "Utilisateur non authentifié",
                    Data = false,
                    Errors = new List<string> { "Token invalide" }
                });

            var result = await _authService.ChangePasswordAsync(userId, request);
            return result.Success ? Ok(result) : BadRequest(result);
        }

        [HttpDelete("delete-account")]
        [Authorize]
        [ProducesResponseType(typeof(ApiResponse<string>), 200)]
        [ProducesResponseType(typeof(ApiResponse<string>), 400)]
        public async Task<IActionResult> DeleteAccount()
        {
            try
            {
                // Récupérer l'ID de l'utilisateur depuis le token JWT
                var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;

                if (string.IsNullOrEmpty(userId))
                {
                    return Unauthorized(ApiResponse<string>.ErrorResponse(
                        "Utilisateur non authentifié",
                        new List<string> { "Token invalide" }
                    ));
                }

                // Appeler le service pour supprimer le compte
                var result = await _authService.DeleteAccountAsync(userId);

                if (!result.Success)
                {
                    return BadRequest(result);
                }

                return Ok(result);
            }
            catch (Exception ex)
            {
                return StatusCode(500, ApiResponse<string>.ErrorResponse(
                    "Erreur lors de la suppression du compte",
                    new List<string> { ex.Message }
                ));
            }
        }

        [AllowAnonymous]
        [HttpPost("promote-to-admin/{userId}")]
        public async Task<IActionResult> PromoteToAdmin(Guid userId)
        {
            try
            {
                var credential = await _context.Credentials.FindAsync(userId);

                if (credential == null)
                {
                    return NotFound(new
                    {
                        success = false,
                        message = "Utilisateur introuvable"
                    });
                }

                if (credential.Role == UserRole.ADMIN)
                {
                    return BadRequest(new
                    {
                        success = false,
                        message = "Cet utilisateur est déjà admin"
                    });
                }

                credential.Role = UserRole.ADMIN;
                credential.UpdatedAt = DateTime.UtcNow;
                await _context.SaveChangesAsync();

                return Ok(new
                {
                    success = true,
                    message = $"{credential.Email} est maintenant ADMIN",
                    email = credential.Email,
                    role = credential.Role.ToString()
                });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new
                {
                    success = false,
                    message = "Erreur serveur",
                    error = ex.Message
                });
            }
        }

        [HttpPost("demote-from-admin/{userId}")]
        [Authorize(Roles = "ADMIN")]
        public async Task<IActionResult> DemoteFromAdmin(Guid userId)
        {
            try
            {
                var credential = await _context.Credentials.FindAsync(userId);

                if (credential == null)
                {
                    return NotFound(new
                    {
                        success = false,
                        message = "Utilisateur introuvable"
                    });
                }

                if (credential.Role == UserRole.STUDENT)
                {
                    return BadRequest(new
                    {
                        success = false,
                        message = "Cet utilisateur est déjà étudiant"
                    });
                }

                credential.Role = UserRole.STUDENT;
                credential.UpdatedAt = DateTime.UtcNow;
                await _context.SaveChangesAsync();

                return Ok(new
                {
                    success = true,
                    message = $"{credential.Email} est maintenant STUDENT",
                    email = credential.Email,
                    role = credential.Role.ToString()
                });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new
                {
                    success = false,
                    message = "Erreur serveur",
                    error = ex.Message
                });
            }
        }
        [HttpPut("block-user/{credentialId}")]
        [Authorize(Roles = "ADMIN")]
        public async Task<IActionResult> BlockUser(Guid credentialId, [FromBody] BlockUserRequest request)
        {
            try
            {
                var credential = await _context.Credentials.FindAsync(credentialId);

                if (credential == null)
                {
                    return NotFound(new
                    {
                        success = false,
                        message = "Utilisateur introuvable"
                    });
                }

                credential.IsActive = false;
                credential.UpdatedAt = DateTime.UtcNow;
                await _context.SaveChangesAsync();

                // ✅ LIGNE CORRIGÉE
                var refreshTokens = _context.RefreshTokens.Where(rt => rt.UserId == credentialId);
                _context.RefreshTokens.RemoveRange(refreshTokens);
                await _context.SaveChangesAsync();

                return Ok(new
                {
                    success = true,
                    message = $"Utilisateur bloqué : {request.Reason}",
                    email = credential.Email
                });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new
                {
                    success = false,
                    message = "Erreur serveur",
                    error = ex.Message
                });
            }
        }

        [HttpPut("unblock-user/{credentialId}")]
        [Authorize(Roles = "ADMIN")]
        public async Task<IActionResult> UnblockUser(Guid credentialId)
        {
            try
            {
                var credential = await _context.Credentials.FindAsync(credentialId);

                if (credential == null)
                {
                    return NotFound(new
                    {
                        success = false,
                        message = "Utilisateur introuvable"
                    });
                }

                credential.IsActive = true;
                credential.UpdatedAt = DateTime.UtcNow;
                await _context.SaveChangesAsync();

                return Ok(new
                {
                    success = true,
                    message = "Utilisateur débloqué",
                    email = credential.Email
                });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new
                {
                    success = false,
                    message = "Erreur serveur",
                    error = ex.Message
                });
            }
        }
        [HttpGet("all-users-with-profiles")]
        [Authorize(Roles = "ADMIN")]
        public async Task<IActionResult> GetAllUsersWithProfiles()
        {
            try
            {
                var credentials = await _context.Credentials.ToListAsync();
                var httpClient = new HttpClient();
                var usersWithProfiles = new List<object>();

                foreach (var credential in credentials)
                {
                    object userProfile = null;

                    try
                    {
                        var response = await httpClient.GetAsync(
                            $"https://localhost:7212/api/Users/by-credential/{credential.Id}"
                        );

                        if (response.IsSuccessStatusCode)
                        {
                            var content = await response.Content.ReadAsStringAsync();
                            userProfile = System.Text.Json.JsonSerializer.Deserialize<object>(content);
                        }
                    }
                    catch
                    {
                        // Pas de profil
                    }

                    usersWithProfiles.Add(new
                    {
                        credentialId = credential.Id,
                        email = credential.Email,
                        role = credential.Role.ToString(),
                        isActive = credential.IsActive,
                        createdAt = credential.CreatedAt,
                        updatedAt = credential.UpdatedAt,
                        profile = userProfile
                    });
                }

                return Ok(new
                {
                    success = true,
                    data = usersWithProfiles,
                    message = $"{usersWithProfiles.Count} utilisateurs trouvés"
                });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new
                {
                    success = false,
                    message = "Erreur serveur",
                    error = ex.Message
                });
            }
        }
        [HttpDelete("delete-credential/{credentialId}")]
        [Authorize(Roles = "ADMIN")]
        public async Task<IActionResult> DeleteCredential(Guid credentialId)
        {
            try
            {
                // 1. Supprimer les RefreshTokens
                var refreshTokens = _context.RefreshTokens
                    .Where(rt => rt.UserId == credentialId);
                _context.RefreshTokens.RemoveRange(refreshTokens);

                // 2. Supprimer les PasswordResets
                var passwordResets = _context.PasswordResets
                    .Where(pr => pr.UserId == credentialId);
                _context.PasswordResets.RemoveRange(passwordResets);

                // 3. Supprimer le Credential
                var credential = await _context.Credentials.FindAsync(credentialId);
                if (credential == null)
                    return NotFound(new { success = false, message = "Credential introuvable" });

                _context.Credentials.Remove(credential);
                await _context.SaveChangesAsync();

                return Ok(new { success = true, message = "Credential supprimé" });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { success = false, message = ex.Message });
            }
        }


    [AllowAnonymous]
        [HttpGet("find-by-email/{email}")]
        public async Task<IActionResult> FindByEmail(string email)
        {
            try
            {
                var credential = await _context.Credentials
                    .FirstOrDefaultAsync(c => c.Email.ToLower() == email.ToLower());

                if (credential == null)
                    return NotFound(new { success = false, message = "Email introuvable" });

                return Ok(new {
                    success = true,
                    credentialId = credential.Id,
                    email = credential.Email,
                    role = credential.Role.ToString()
                });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { success = false, message = ex.Message });
            }
        }
    }
}