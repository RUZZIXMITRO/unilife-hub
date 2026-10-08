using AuthenticationService1.Data;
using AuthenticationService1.DTOs;
using AuthenticationService1.Models.Entities;
using AuthenticationService1.Repositories.Interfaces;
using AuthenticationService1.Services.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace AuthenticationService1.Services
{
     public class AuthService : IAuthService
    {
        private readonly ICredentialRepository _credentialRepository;
        private readonly ITokenService _tokenService;
        private readonly IEmailService _emailService;
        private readonly IPasswordService _passwordService;
        private readonly ILogger<AuthService> _logger;
        private readonly AuthDbContext _context;

        public AuthService(
            ICredentialRepository credentialRepository,
            ITokenService tokenService,
            IEmailService emailService,
            IPasswordService passwordService,
            ILogger<AuthService> logger,
            AuthDbContext context)  
        {
            _credentialRepository = credentialRepository;
            _tokenService = tokenService;
            _emailService = emailService;
            _passwordService = passwordService;
            _logger = logger;
            _context = context;  
        }

        public async Task<ApiResponse<AuthResponse>> RegisterAsync(RegisterRequest request)
        {
            // Vérifier si l'email existe déjà
            if (await _credentialRepository.EmailExistsAsync(request.Email))
            {
                return ApiResponse<AuthResponse>.ErrorResponse(
                    "Cet email est déjà utilisé",
                    new List<string> { "Email déjà enregistré" }
                );
            }

            // Créer le credential
            var credential = new Credential
            {
                Email = request.Email,
                PasswordHash = _passwordService.HashPassword(request.Password),
                IsActive = true
            };

            await _credentialRepository.AddAsync(credential);
            await _credentialRepository.SaveChangesAsync();

            // Générer les tokens
            var accessToken = _tokenService.GenerateAccessToken(credential);
            var refreshToken = _tokenService.GenerateRefreshToken();

            // Sauvegarder le refresh token
            var refreshTokenEntity = new RefreshToken
            {
                UserId = credential.Id,
                Token = refreshToken,
                ExpiresAt = DateTime.UtcNow.AddDays(7)
            };

            _context.RefreshTokens.Add(refreshTokenEntity);
            await _context.SaveChangesAsync();

            // Envoyer l'email de bienvenue (async, sans attendre)
            _ = _emailService.SendWelcomeEmailAsync(credential.Email);

            var response = new AuthResponse
            {
                AccessToken = accessToken,
                RefreshToken = refreshToken,
                ExpiresAt = DateTime.UtcNow.AddHours(1),
                User = new UserInfo
                {
                    Id = credential.Id,
                    Email = credential.Email,
                    IsActive = credential.IsActive
                }
            };

            return ApiResponse<AuthResponse>.SuccessResponse(
                response,
                "Inscription réussie"
            );
        }

        public async Task<ApiResponse<AuthResponse>> LoginAsync(LoginRequest request)
        {
            // Trouver l'utilisateur
            var credential = await _credentialRepository.GetByEmailAsync(request.Email);

            if (credential == null || !_passwordService.VerifyPassword(request.Password, credential.PasswordHash))
            {
                return ApiResponse<AuthResponse>.ErrorResponse(
                    "Email ou mot de passe incorrect",
                    new List<string> { "Identifiants invalides" }
                );
            }

            if (!credential.IsActive)
            {
                return ApiResponse<AuthResponse>.ErrorResponse(
                    "Compte désactivé",
                    new List<string> { "Votre compte est désactivé" }
                );
            }

            // Générer les tokens
            var accessToken = _tokenService.GenerateAccessToken(credential);
            var refreshToken = _tokenService.GenerateRefreshToken();

            // Sauvegarder le refresh token
            var refreshTokenEntity = new RefreshToken
            {
                UserId = credential.Id,
                Token = refreshToken,
                ExpiresAt = DateTime.UtcNow.AddDays(7)
            };

            _context.RefreshTokens.Add(refreshTokenEntity);
            await _context.SaveChangesAsync();

            var response = new AuthResponse
            {
                AccessToken = accessToken,
                RefreshToken = refreshToken,
                ExpiresAt = DateTime.UtcNow.AddHours(1),
                User = new UserInfo
                {
                    Id = credential.Id,
                    Email = credential.Email,
                    IsActive = credential.IsActive
                }
            };

            return ApiResponse<AuthResponse>.SuccessResponse(
                response,
                "Connexion réussie"
            );
        }

        public async Task<ApiResponse<AuthResponse>> RefreshTokenAsync(RefreshTokenRequest request)
        {
            // Vérifier le refresh token
            var refreshToken = await _context.RefreshTokens
                .Include(rt => rt.User)
                .FirstOrDefaultAsync(rt => rt.Token == request.RefreshToken);

            if (refreshToken == null || !refreshToken.IsValid)
            {
                return ApiResponse<AuthResponse>.ErrorResponse(
                    "Refresh token invalide ou expiré"
                );
            }

            // Générer nouveaux tokens
            var newAccessToken = _tokenService.GenerateAccessToken(refreshToken.User);
            var newRefreshToken = _tokenService.GenerateRefreshToken();

            // Supprimer l'ancien refresh token
            _context.RefreshTokens.Remove(refreshToken);

            // Créer le nouveau refresh token
            var newRefreshTokenEntity = new RefreshToken
            {
                UserId = refreshToken.UserId,
                Token = newRefreshToken,
                ExpiresAt = DateTime.UtcNow.AddDays(7)
            };

            _context.RefreshTokens.Add(newRefreshTokenEntity);
            await _context.SaveChangesAsync();

            var response = new AuthResponse
            {
                AccessToken = newAccessToken,
                RefreshToken = newRefreshToken,
                ExpiresAt = DateTime.UtcNow.AddHours(1),
                User = new UserInfo
                {
                    Id = refreshToken.User.Id,
                    Email = refreshToken.User.Email,
                    IsActive = refreshToken.User.IsActive
                }
            };

            return ApiResponse<AuthResponse>.SuccessResponse(
                response,
                "Token rafraîchi avec succès"
            );
        }

        public async Task<ApiResponse<string>> LogoutAsync(string token)
        {
            // Ajouter le token à la blacklist
            var blacklistEntry = new TokenBlacklist
            {
                Token = token
            };

            _context.TokenBlacklist.Add(blacklistEntry);
            await _context.SaveChangesAsync();

            return ApiResponse<string>.SuccessResponse(
                null,
                "Déconnexion réussie"
            );
        }

        public async Task<ApiResponse<string>> RequestPasswordResetAsync(RequestPasswordResetRequest request)
        {
            var credential = await _credentialRepository.GetByEmailAsync(request.Email);

            if (credential == null)
            {
                // Pour la sécurité, ne pas révéler si l'email existe
                return ApiResponse<string>.SuccessResponse(
                    null,
                    "Si cet email existe, un lien de réinitialisation a été envoyé"
                );
            }

            // Générer le token de reset
            var resetToken = Guid.NewGuid().ToString();

            var passwordReset = new PasswordReset
            {
                UserId = credential.Id,
                Email = credential.Email,
                Token = resetToken,
                ExpiresAt = DateTime.UtcNow.AddHours(1)
            };

            _context.PasswordResets.Add(passwordReset);
            await _context.SaveChangesAsync();

            // Envoyer l'email
            await _emailService.SendPasswordResetEmailAsync(credential.Email, resetToken);

            return ApiResponse<string>.SuccessResponse(
                null,
                "Si cet email existe, un lien de réinitialisation a été envoyé"
            );
        }

        public async Task<ApiResponse<string>> ResetPasswordAsync(ResetPasswordRequest request)
        {
            try
            {
                // 1. Vérifier le token
                var passwordReset = await _context.PasswordResets
                    .FirstOrDefaultAsync(pr => pr.Token == request.Token);

                if (passwordReset == null)
                {
                    return ApiResponse<string>.ErrorResponse("Token de réinitialisation invalide");
                }


                // 2. Vérifier validité
                if (!passwordReset.IsValid)
                {
                    return ApiResponse<string>.ErrorResponse("Token de réinitialisation invalide ou expiré");
                }

                // 3. Chercher le Credential par Email (pas par navigation)
                var credential = await _context.Credentials
                    .FirstOrDefaultAsync(c => c.Email == passwordReset.Email);

                if (credential == null)
                {
                    return ApiResponse<string>.ErrorResponse("Utilisateur introuvable");
                }

                // 4. Mettre à jour le mot de passe
                var oldPasswordHash = credential.PasswordHash;
                credential.PasswordHash = _passwordService.HashPassword(request.NewPassword);
                credential.UpdatedAt = DateTime.UtcNow;


                // 5. Marquer le token comme utilisé
                passwordReset.Used = true;

                // 6. Sauvegarder en base
                _context.Credentials.Update(credential);
                _context.PasswordResets.Update(passwordReset);

                var savedRows = await _context.SaveChangesAsync();

                return ApiResponse<string>.SuccessResponse(
                    null,
                    "Mot de passe réinitialisé avec succès"
                );
            }
            catch (Exception ex)
            {
                return ApiResponse<string>.ErrorResponse("Erreur lors de la réinitialisation du mot de passe");
            }
        }

        public async Task<ApiResponse<bool>> ChangePasswordAsync(string userId, ChangePasswordRequest request)
        {
            try
            {

                // Utiliser Credential au lieu de User
                var credential = await _context.Credentials.FirstOrDefaultAsync(c => c.Id == Guid.Parse(userId));

                if (credential == null)
                {
                    return ApiResponse<bool>.ErrorResponse("Utilisateur non trouvé");
                }

                // Vérifier l'ancien mot de passe
                if (!BCrypt.Net.BCrypt.Verify(request.CurrentPassword, credential.PasswordHash))
                {
                    return ApiResponse<bool>.ErrorResponse("Mot de passe actuel incorrect");
                }

                // Hasher le nouveau mot de passe
                credential.PasswordHash = BCrypt.Net.BCrypt.HashPassword(request.NewPassword);
                credential.UpdatedAt = DateTime.UtcNow;

                // Sauvegarder en base
                _context.Credentials.Update(credential);
                await _context.SaveChangesAsync();


                return ApiResponse<bool>.SuccessResponse(true, "Mot de passe changé avec succès");
            }
            catch (Exception ex)
            {
                return ApiResponse<bool>.ErrorResponse("Erreur lors du changement de mot de passe");
            }
        }

        public async Task<ApiResponse<string>> DeleteAccountAsync(string userId)
        {
            try
            {
                // Convertir le userId en Guid
                if (!Guid.TryParse(userId, out var credentialId))
                {
                    return ApiResponse<string>.ErrorResponse(
                        "Identifiant utilisateur invalide",
                        new List<string> { "Format d'ID incorrect" }
                    );
                }

                // Récupérer le credential avec les tokens associés
                var credential = await _context.Credentials
                    .Include(c => c.RefreshTokens)
                    .FirstOrDefaultAsync(c => c.Id == credentialId);

                if (credential == null)
                {
                    return ApiResponse<string>.ErrorResponse(
                        "Compte introuvable",
                        new List<string> { "L'utilisateur n'existe pas" }
                    );
                }

                // Supprimer tous les refresh tokens
                if (credential.RefreshTokens != null && credential.RefreshTokens.Any())
                {
                    _context.RefreshTokens.RemoveRange(credential.RefreshTokens);
                }

                // Supprimer le credential
                _context.Credentials.Remove(credential);

                // Sauvegarder les changements
                await _context.SaveChangesAsync();

                return ApiResponse<string>.SuccessResponse(
                    "Compte supprimé avec succès",
                    "Votre compte a été définitivement supprimé"
                );
            }
            catch (Exception ex)
            {
                return ApiResponse<string>.ErrorResponse(
                    "Erreur lors de la suppression du compte",
                    new List<string> { ex.Message }
                );
            }
        }
    }
}