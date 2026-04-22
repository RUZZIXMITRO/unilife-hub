package com.unilifehub.cours_formations_service.controller;

import com.unilifehub.cours_formations_service.dto.response.ApiResponse;
import com.unilifehub.cours_formations_service.service.LikeService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/likes")
@RequiredArgsConstructor
public class LikeController {

    private final LikeService likeService;

    @PostMapping("/{resourceId}")
    public ResponseEntity<ApiResponse<?>> toggleLike(
            @PathVariable Integer resourceId,
            @RequestHeader("X-User-Id") String userId) {
        boolean liked = likeService.toggleLike(Integer.parseInt(userId), resourceId);
        return ResponseEntity.ok(ApiResponse.success(
                liked ? "Liked" : "Unliked", liked));
    }

    @GetMapping("/{resourceId}/count")
    public ResponseEntity<ApiResponse<Long>> getLikesCount(
            @PathVariable Integer resourceId) {
        return ResponseEntity.ok(ApiResponse.success(
                "Nombre de likes",
                likeService.getLikesCount(resourceId)));
    }

    @GetMapping("/{resourceId}/status")
    public ResponseEntity<ApiResponse<Boolean>> isLiked(
            @PathVariable Integer resourceId,
            @RequestHeader("X-User-Id") String userId) {
        return ResponseEntity.ok(ApiResponse.success(
                "Statut like",
                likeService.isLiked(Integer.parseInt(userId), resourceId)));
    }
}