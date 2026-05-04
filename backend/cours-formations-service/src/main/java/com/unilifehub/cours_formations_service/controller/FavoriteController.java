package com.unilifehub.cours_formations_service.controller;

import com.unilifehub.cours_formations_service.dto.response.ApiResponse;
import com.unilifehub.cours_formations_service.service.FavoriteService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/favorites")
@RequiredArgsConstructor
public class FavoriteController {

    private final FavoriteService favoriteService;

    private Integer parseUserId(String userId) {
        String uid = userId;
        if (uid == null) {
            var auth = SecurityContextHolder.getContext().getAuthentication();
            if (auth != null && !auth.getPrincipal().equals("anonymousUser"))
                uid = auth.getPrincipal().toString();
        }
        if (uid == null) throw new RuntimeException("Utilisateur non authentifié");
        try { return Integer.parseInt(uid); }
        catch (NumberFormatException e) { return Math.abs(uid.hashCode()); }
    }

    @GetMapping
    public ResponseEntity<ApiResponse<?>> getMyFavorites(
            @RequestHeader(value = "X-User-Id", required = false) String userId) {
        return ResponseEntity.ok(ApiResponse.success("Favoris récupérés",
                favoriteService.getMyFavorites(parseUserId(userId))));
    }

    @PostMapping("/{resourceId}")
    public ResponseEntity<ApiResponse<?>> addFavorite(
            @PathVariable Integer resourceId,
            @RequestParam String type,
            @RequestHeader(value = "X-User-Id", required = false) String userId) {
        return ResponseEntity.ok(ApiResponse.success("Ajouté aux favoris",
                favoriteService.addFavorite(parseUserId(userId), resourceId, type)));
    }

    @DeleteMapping("/{resourceId}")
    public ResponseEntity<ApiResponse<Void>> removeFavorite(
            @PathVariable Integer resourceId,
            @RequestHeader(value = "X-User-Id", required = false) String userId) {
        favoriteService.removeFavorite(parseUserId(userId), resourceId);
        return ResponseEntity.ok(ApiResponse.success("Retiré des favoris", null));
    }
}