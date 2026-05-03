package com.unilifehub.cours_formations_service.controller;

import com.unilifehub.cours_formations_service.dto.response.ApiResponse;
import com.unilifehub.cours_formations_service.service.FavoriteService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/favorites")
@RequiredArgsConstructor
public class FavoriteController {

    private final FavoriteService favoriteService;

    @GetMapping
    public ResponseEntity<ApiResponse<?>> getMyFavorites(
            @RequestHeader("X-User-Id") String userId) {
        return ResponseEntity.ok(ApiResponse.success(
                "Favoris récupérés",
                favoriteService.getMyFavorites(Integer.parseInt(userId))));
    }

    @PostMapping("/{resourceId}")
    public ResponseEntity<ApiResponse<?>> addFavorite(
            @PathVariable Integer resourceId,
            @RequestParam String type,
            @RequestHeader("X-User-Id") String userId) {
        return ResponseEntity.ok(ApiResponse.success(
                "Ajouté aux favoris",
                favoriteService.addFavorite(Integer.parseInt(userId), resourceId, type)));
    }

    @DeleteMapping("/{resourceId}")
    public ResponseEntity<ApiResponse<Void>> removeFavorite(
            @PathVariable Integer resourceId,
            @RequestHeader("X-User-Id") String userId) {
        favoriteService.removeFavorite(Integer.parseInt(userId), resourceId);
        return ResponseEntity.ok(ApiResponse.success("Retiré des favoris", null));
    }
}