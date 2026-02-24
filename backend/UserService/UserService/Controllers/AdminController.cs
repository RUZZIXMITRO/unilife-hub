using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using UserService.DTOs.Requests;
using UserService.Services.Interfaces;

namespace UserService.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize(Roles = "ADMIN")]
    public class AdminController : ControllerBase
    {
        private readonly IAdminService _adminService;

        public AdminController(IAdminService adminService)
        {
            _adminService = adminService;
        }

        // ✅ DÉJÀ EXISTANT
        [HttpPut("activate/{userId}")]
        public async Task<IActionResult> ActivateAccount(Guid userId)
        {
            var result = await _adminService.ActivateAccountAsync(userId);
            return result.Success ? Ok(result) : BadRequest(result);
        }

        // ✅ DÉJÀ EXISTANT
        [HttpPut("deactivate/{userId}")]
        public async Task<IActionResult> DeactivateAccount(Guid userId)
        {
            var result = await _adminService.DeactivateAccountAsync(userId);
            return result.Success ? Ok(result) : BadRequest(result);
        }

        // ✅ DÉJÀ EXISTANT
        [HttpPut("block/{userId}")]
        public async Task<IActionResult> BlockUser(Guid userId, [FromBody] BlockUserRequest request)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);
            var result = await _adminService.BlockUserAsync(userId, request);
            return result.Success ? Ok(result) : BadRequest(result);
        }

        // ✅ DÉJÀ EXISTANT
        [HttpPut("unblock/{userId}")]
        public async Task<IActionResult> UnblockUser(Guid userId)
        {
            var result = await _adminService.UnblockUserAsync(userId);
            return result.Success ? Ok(result) : BadRequest(result);
        }

        // ✅ NOUVEAU : Supprimer un utilisateur par son User ID
        [HttpDelete("delete/{userId}")]
        public async Task<IActionResult> DeleteUser(Guid userId)
        {
            var result = await _adminService.DeleteUserAsync(userId);
            return result.Success ? Ok(result) : NotFound(result);
        }

        // ✅ NOUVEAU : Supprimer par Credential ID
        [HttpDelete("delete-by-credential/{credentialId}")]
        public async Task<IActionResult> DeleteUserByCredential(Guid credentialId)
        {
            var result = await _adminService.DeleteUserByCredentialIdAsync(credentialId);
            return result.Success ? Ok(result) : NotFound(result);
        }

        // ✅ NOUVEAU : Lister tous les utilisateurs
        [HttpGet("users")]
        public async Task<IActionResult> GetAllUsers()
        {
            var result = await _adminService.GetAllUsersAsync();
            return Ok(result);
        }

        // ✅ Promouvoir en Admin
        [HttpPut("promote/{userId}")]
        public async Task<IActionResult> PromoteToAdmin(Guid userId)
        {
            var result = await _adminService.PromoteToAdminAsync(userId);
            return result.Success ? Ok(result) : BadRequest(result);
        }

        // ✅ Rétrograder en Student
        [HttpPut("demote/{userId}")]
        public async Task<IActionResult> DemoteFromAdmin(Guid userId)
        {
            var result = await _adminService.DemoteFromAdminAsync(userId);
            return result.Success ? Ok(result) : BadRequest(result);
        }

    }
}