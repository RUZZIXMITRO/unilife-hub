using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using UserService.DTOs.Requests;
using UserService.DTOs.Responses;
using UserService.Services.Interfaces;

namespace UserService.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class UsersController : ControllerBase
    {
        private readonly IUserService _userService;

        public UsersController(IUserService userService)
        {
            _userService = userService;
        }

        // ==================== CRÉATION D'UTILISATEUR ====================
        [HttpPost]
        [Authorize]
        public async Task<IActionResult> RegisterUser([FromBody] RegisterUserRequest request)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            var result = await _userService.RegisterUserAsync(request);
            return result.Success ? Ok(result) : BadRequest(result);
        }

        // ==================== RÉCUPÉRATION PAR ID ====================
        [HttpGet("{id}")]
        [Authorize]
        public async Task<IActionResult> GetUserById(Guid id)
        {
            var result = await _userService.GetUserByIdAsync(id);
            return result.Success ? Ok(result) : NotFound(result);
        }

        // ==================== NOUVEAU : RÉCUPÉRATION PAR CREDENTIAL ID ====================
        [HttpGet("by-credential/{credentialId}")]
        [Authorize]
        public async Task<IActionResult> GetUserByCredentialId(Guid credentialId)
        {
            try
            {
                var result = await _userService.GetUserByCredentialIdAsync(credentialId);

                if (result.Success)
                {
                    return Ok(result);
                }

                return NotFound(result);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new ApiResponse<UserResponse>
                {
                    Success = false,
                    Message = "Erreur serveur lors de la récupération du profil",
                    Data = null,
                    Errors = new List<string> { ex.Message }
                });
            }
        }

        // ==================== RÉCUPÉRATION PAR EMAIL ====================
        [HttpGet("email/{email}")]
        [Authorize]
        public async Task<IActionResult> GetUserByEmail(string email)
        {
            var result = await _userService.GetUserByEmailAsync(email);
            return result.Success ? Ok(result) : NotFound(result);
        }

        // ==================== MISE À JOUR ====================
        [HttpPut("{id}")]
        [Authorize]
        public async Task<IActionResult> UpdateUser(Guid id, [FromBody] UpdateUserRequest request)
        {
            var result = await _userService.UpdateUserAsync(id, request);
            return result.Success ? Ok(result) : BadRequest(result);
        }

        // ==================== SUPPRESSION ====================
        [HttpDelete("{id}")]
        [Authorize]
        public async Task<IActionResult> DeleteUser(Guid id)
        {
            var result = await _userService.DeleteUserAsync(id);
            return result.Success ? Ok(result) : NotFound(result);
        }

        // ==================== ADMIN : LISTE TOUS LES UTILISATEURS ====================
        [HttpGet]
        [Authorize(Roles = "ADMIN")]
        public async Task<IActionResult> GetAllUsers()
        {
            var result = await _userService.GetAllUsersAsync();
            return Ok(result);
        }

        // ==================== ADMIN : RECHERCHE ====================
        [HttpGet("search")]
        [Authorize(Roles = "ADMIN")]
        public async Task<IActionResult> SearchUsers([FromQuery] string query)
        {
            var result = await _userService.SearchUsersAsync(query);
            return Ok(result);
        }

        // ==================== ADMIN : FILTRER PAR STATUT ====================
        [HttpGet("status/{isActive}")]
        [Authorize(Roles = "ADMIN")]
        public async Task<IActionResult> GetUsersByStatus(bool isActive)
        {
            var result = await _userService.GetUsersByStatusAsync(isActive);
            return Ok(result);
        }
        // ==================== ADMIN : BLOQUER ====================
        [HttpPut("{id}/block")]
        [Authorize(Roles = "ADMIN")]
        public async Task<IActionResult> BlockUser(Guid id, [FromBody] BlockUserRequest request)
        {
            var result = await _userService.BlockUserAsync(id, request.Reason, request.Until);
            return result.Success ? Ok(result) : BadRequest(result);
        }

        // ==================== ADMIN : DÉBLOQUER ====================
        [HttpPut("{id}/unblock")]
        [Authorize(Roles = "ADMIN")]
        public async Task<IActionResult> UnblockUser(Guid id)
        {
            var result = await _userService.UnblockUserAsync(id);
            return result.Success ? Ok(result) : BadRequest(result);
        }

        // ==================== ADMIN : SUPPRIMER PAR CREDENTIAL ID ====================
        [HttpDelete("by-credential/{credentialId}")]
        [Authorize(Roles = "ADMIN")]
        public async Task<IActionResult> DeleteUserByCredentialId(Guid credentialId)
        {
            var result = await _userService.DeleteUserByCredentialIdAsync(credentialId);
            return result.Success ? Ok(result) : NotFound(result);
        }


    }
}