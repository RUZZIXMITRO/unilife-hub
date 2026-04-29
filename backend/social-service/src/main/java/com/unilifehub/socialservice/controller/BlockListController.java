package com.unilifehub.socialservice.controller;

import com.unilifehub.socialservice.config.AuthUtils;
import com.unilifehub.socialservice.dto.response.ApiResponse;
import com.unilifehub.socialservice.dto.response.BlockListResponse;
import com.unilifehub.socialservice.service.BlockListService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/social/users")
public class BlockListController {

    @Autowired
    private BlockListService blockListService;

    // POST /api/social/users/{userId}/block
    @PostMapping("/{userId}/block")
    public ResponseEntity<ApiResponse<BlockListResponse>> blockUser(
            @PathVariable String userId,
            Authentication auth) {
        String blockerId = AuthUtils.getRequiredUserId(auth);
        return ResponseEntity.ok(
                ApiResponse.success("Utilisateur bloqué avec succès",
                        blockListService.blockUser(blockerId, userId)));
    }

    // DELETE /api/social/users/{userId}/unblock
    @DeleteMapping("/{userId}/unblock")
    public ResponseEntity<ApiResponse<Void>> unblockUser(
            @PathVariable String userId,
            Authentication auth) {
        String blockerId = AuthUtils.getRequiredUserId(auth);
        blockListService.unblockUser(blockerId, userId);
        return ResponseEntity.ok(
                ApiResponse.success("Utilisateur débloqué"));
    }

    // GET /api/social/users/blocked
    @GetMapping("/blocked")
    public ResponseEntity<ApiResponse<List<BlockListResponse>>> getBlockedUsers(
            Authentication auth) {
        String blockerId = AuthUtils.getRequiredUserId(auth);
        return ResponseEntity.ok(
                ApiResponse.success("Liste récupérée",
                        blockListService.getBlockedUsers(blockerId)));
    }

    // GET /api/social/users/{userId}/is-blocked
    @GetMapping("/{userId}/is-blocked")
    public ResponseEntity<ApiResponse<Map<String, Boolean>>> isBlocked(
            @PathVariable String userId,
            Authentication auth) {
        String blockerId = AuthUtils.getRequiredUserId(auth);
        boolean blocked = blockListService.isBlocked(blockerId, userId);
        return ResponseEntity.ok(
                ApiResponse.success("Statut vérifié",
                        Map.of("isBlocked", blocked)));
    }
}