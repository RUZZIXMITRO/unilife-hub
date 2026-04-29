package com.unilifehub.socialservice.controller;

import com.unilifehub.socialservice.config.AuthUtils;
import com.unilifehub.socialservice.dto.response.ApiResponse;
import com.unilifehub.socialservice.dto.response.ShareResponse;
import com.unilifehub.socialservice.service.ShareService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/social/posts")
public class ShareController {

    @Autowired
    private ShareService shareService;

    // POST /api/social/posts/{postId}/share
    @PostMapping("/{postId}/share")
    public ResponseEntity<ApiResponse<ShareResponse>> sharePost(
            @PathVariable Long postId,
            Authentication auth) {
        String userId = AuthUtils.getRequiredUserId(auth);
        ShareResponse dto = shareService.sharePost(postId, userId);
        return ResponseEntity.ok(ApiResponse.success("Post partagé avec succès", dto));
    }

    // DELETE /api/social/posts/{postId}/share
    @DeleteMapping("/{postId}/share")
    public ResponseEntity<ApiResponse<Void>> unsharePost(
            @PathVariable Long postId,
            Authentication auth) {
        String userId = AuthUtils.getRequiredUserId(auth);
        shareService.unsharePost(postId, userId);
        return ResponseEntity.ok(ApiResponse.success("Partage annulé"));
    }

    // GET /api/social/posts/{postId}/shares/count
    @GetMapping("/{postId}/shares/count")
    public ResponseEntity<ApiResponse<Map<String, Object>>> countShares(
            @PathVariable Long postId) {
        long count = shareService.countShares(postId);
        return ResponseEntity.ok(ApiResponse.success("Compteur de partages récupéré",
                Map.of("postId", postId, "shareCount", count)));
    }
}