package com.unilife.favorite.controller;

import com.unilife.favorite.dto.request.AddFavoriteRequest;
import com.unilife.favorite.dto.response.ApiResponse;
import com.unilife.favorite.dto.response.FavoriteResponse;
import com.unilife.favorite.service.IFavoriteService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/favorites")
@Tag(name = "Favorites", description = "Gestion des produits favoris")
public class FavoriteController {

    private final IFavoriteService favoriteService;

    public FavoriteController(IFavoriteService favoriteService) {
        this.favoriteService = favoriteService;
    }

    @PostMapping
    @Operation(summary = "Ajouter un produit aux favoris")
    public ResponseEntity<ApiResponse<FavoriteResponse>> addFavorite(
            @Valid @RequestBody AddFavoriteRequest request,
            @RequestHeader("X-User-Id") String userId) {
        ApiResponse<FavoriteResponse> response = favoriteService.addFavorite(userId, request);
        return ResponseEntity.status(response.isSuccess() ? HttpStatus.CREATED : HttpStatus.CONFLICT)
                .body(response);
    }

    @GetMapping
    @Operation(summary = "Voir mes favoris")
    public ResponseEntity<ApiResponse<List<FavoriteResponse>>> getFavorites(
            @RequestHeader("X-User-Id") String userId) {
        return ResponseEntity.ok(favoriteService.getFavorites(userId));
    }

    @DeleteMapping("/{productId}")
    @Operation(summary = "Retirer un produit des favoris")
    public ResponseEntity<ApiResponse<Boolean>> removeFavorite(
            @PathVariable String productId,
            @RequestHeader("X-User-Id") String userId) {
        ApiResponse<Boolean> response = favoriteService.removeFavorite(userId, productId);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/{productId}/check")
    @Operation(summary = "Verifier si un produit est en favori")
    public ResponseEntity<ApiResponse<Boolean>> isFavorite(
            @PathVariable String productId,
            @RequestHeader("X-User-Id") String userId) {
        return ResponseEntity.ok(favoriteService.isFavorite(userId, productId));
    }

    @GetMapping("/{productId}/count")
    @Operation(summary = "Nombre de fois qu un produit est en favori")
    public ResponseEntity<ApiResponse<Long>> getFavoriteCount(@PathVariable String productId) {
        return ResponseEntity.ok(favoriteService.getFavoriteCount(productId));
    }
}