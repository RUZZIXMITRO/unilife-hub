package com.unilifehub.cours_formations_service.controller;

import com.unilifehub.cours_formations_service.dto.response.ApiResponse;
import com.unilifehub.cours_formations_service.service.FavoriteService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;
import java.nio.charset.StandardCharsets;
import java.util.Base64;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

@RestController
@RequestMapping("/api/favorites")
@RequiredArgsConstructor
public class FavoriteController {

    private final FavoriteService favoriteService;

    @GetMapping
    public ResponseEntity<ApiResponse<?>> getMyFavorites(
            @RequestParam(value = "userId", required = false) String userIdParam,
            @RequestHeader(value = "X-User-Id", required = false) String userId,
            @RequestHeader(value = "Authorization", required = false) String authorization) {
        userId = resolveUserId(userIdParam, userId, authorization);
        return ResponseEntity.ok(ApiResponse.success(
                "Favoris récupérés",
                favoriteService.getMyFavorites(userId)));
    }

    @PostMapping("/{resourceId}")
    public ResponseEntity<ApiResponse<?>> addFavorite(
            @PathVariable Integer resourceId,
            @RequestParam String type,
            @RequestParam(value = "userId", required = false) String userIdParam,
            @RequestHeader(value = "X-User-Id", required = false) String userId,
            @RequestHeader(value = "Authorization", required = false) String authorization) {
        userId = resolveUserId(userIdParam, userId, authorization);
        boolean result = favoriteService.addFavorite(userId, resourceId, type);
        return ResponseEntity.ok(ApiResponse.success("Ajouté aux favoris", result));
    }

    @DeleteMapping("/{resourceId}")
    public ResponseEntity<ApiResponse<Void>> removeFavorite(
            @PathVariable Integer resourceId,
            @RequestParam(value = "userId", required = false) String userIdParam,
            @RequestHeader(value = "X-User-Id", required = false) String userId,
            @RequestHeader(value = "Authorization", required = false) String authorization) {
        userId = resolveUserId(userIdParam, userId, authorization);
        favoriteService.removeFavorite(userId, resourceId);
        return ResponseEntity.ok(ApiResponse.success("Retiré des favoris", null));
    }

    private String resolveUserId(String userIdParam, String userId, String authorization) {
        if (userIdParam != null && !userIdParam.isBlank()) {
            return userIdParam;
        }
        if (userId != null && !userId.isBlank()) {
            return userId;
        }

        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication != null && authentication.getName() != null &&
                !authentication.getName().isBlank() && !"anonymousUser".equals(authentication.getName())) {
            return authentication.getName();
        }

        if (authorization == null || !authorization.startsWith("Bearer ")) {
            throw new RuntimeException("Utilisateur introuvable");
        }

        try {
            String token = authorization.substring(7);
            String[] parts = token.split("\\.");
            if (parts.length < 2) {
                throw new RuntimeException("Token invalide");
            }

            String payloadJson = new String(Base64.getUrlDecoder().decode(parts[1]), StandardCharsets.UTF_8);
            String sub = extractJsonField(payloadJson, "sub");
            String nameId = extractJsonField(payloadJson, "nameid");
            String resolved = (sub != null && !sub.isBlank()) ? sub : nameId;

            if (resolved == null || resolved.isBlank()) {
                throw new RuntimeException("Utilisateur introuvable dans le token");
            }
            return resolved;
        } catch (Exception e) {
            throw new RuntimeException("Impossible d'identifier l'utilisateur");
        }
    }

    private String extractJsonField(String json, String field) {
        Pattern p = Pattern.compile("\"" + Pattern.quote(field) + "\"\\s*:\\s*\"([^\"]+)\"");
        Matcher m = p.matcher(json);
        return m.find() ? m.group(1) : null;
    }
}