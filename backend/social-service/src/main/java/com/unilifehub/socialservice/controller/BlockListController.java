package com.unilifehub.socialservice.controller;
import com.unilifehub.socialservice.dto.response.BlockListResponse;
import com.unilifehub.socialservice.service.BlockListService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/social/users")
@CrossOrigin(origins = "*")
public class BlockListController {

    @Autowired
    private BlockListService blockListService;

    // POST /api/social/users/{userId}/block
    @PostMapping("/{userId}/block")
    public ResponseEntity<?> blockUser(
            @PathVariable Long userId,
            @RequestHeader("X-User-Id") Long blockerId) {
        try {
            BlockListResponse dto = blockListService.blockUser(blockerId, userId);
            return ResponseEntity.ok(Map.of(
                    "success", true,
                    "message", "Utilisateur bloqué avec succès",
                    "data", dto
            ));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of(
                    "success", false,
                    "message", e.getMessage()
            ));
        }
    }

    // DELETE /api/social/users/{userId}/unblock
    @DeleteMapping("/{userId}/unblock")
    public ResponseEntity<?> unblockUser(
            @PathVariable Long userId,
            @RequestHeader("X-User-Id") Long blockerId) {
        try {
            blockListService.unblockUser(blockerId, userId);
            return ResponseEntity.ok(Map.of(
                    "success", true,
                    "message", "Utilisateur débloqué"
            ));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of(
                    "success", false,
                    "message", e.getMessage()
            ));
        }
    }

    // GET /api/social/users/blocked
    @GetMapping("/blocked")
    public ResponseEntity<?> getBlockedUsers(
            @RequestHeader("X-User-Id") Long blockerId) {
        List<BlockListResponse> list = blockListService.getBlockedUsers(blockerId);
        return ResponseEntity.ok(Map.of(
                "success", true,
                "data", list
        ));
    }

    // GET /api/social/users/{userId}/is-blocked
    @GetMapping("/{userId}/is-blocked")
    public ResponseEntity<?> isBlocked(
            @PathVariable Long userId,
            @RequestHeader("X-User-Id") Long blockerId) {
        boolean blocked = blockListService.isBlocked(blockerId, userId);
        return ResponseEntity.ok(Map.of(
                "success", true,
                "data", Map.of("isBlocked", blocked)
        ));
    }
}