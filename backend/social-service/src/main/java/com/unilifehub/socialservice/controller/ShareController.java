package com.unilifehub.socialservice.controller;
import com.unilifehub.socialservice.dto.response.ShareResponse;
import com.unilifehub.socialservice.service.ShareService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/social/posts")
@CrossOrigin(origins = "*")
public class ShareController {

    @Autowired
    private ShareService shareService;

    // POST /api/social/posts/{postId}/share
    @PostMapping("/{postId}/share")
    public ResponseEntity<?> sharePost(
            @PathVariable Long postId,
            @RequestHeader("X-User-Id") Long userId) {
        try {
            ShareResponse dto = shareService.sharePost(postId, userId);
            return ResponseEntity.ok(Map.of(
                    "success", true,
                    "message", "Post partagé avec succès",
                    "data", dto
            ));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of(
                    "success", false,
                    "message", e.getMessage()
            ));
        }
    }

    // DELETE /api/social/posts/{postId}/share
    @DeleteMapping("/{postId}/share")
    public ResponseEntity<?> unsharePost(
            @PathVariable Long postId,
            @RequestHeader("X-User-Id") Long userId) {
        try {
            shareService.unsharePost(postId, userId);
            return ResponseEntity.ok(Map.of(
                    "success", true,
                    "message", "Partage annulé"
            ));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of(
                    "success", false,
                    "message", e.getMessage()
            ));
        }
    }

    // GET /api/social/posts/{postId}/shares/count
    @GetMapping("/{postId}/shares/count")
    public ResponseEntity<?> countShares(@PathVariable Long postId) {
        long count = shareService.countShares(postId);
        return ResponseEntity.ok(Map.of(
                "success", true,
                "data", Map.of("postId", postId, "shareCount", count)
        ));
    }
}