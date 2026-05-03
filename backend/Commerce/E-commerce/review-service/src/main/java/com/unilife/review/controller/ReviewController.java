package com.unilife.review.controller;

import com.unilife.review.dto.request.AdminResponseRequest;
import com.unilife.review.dto.request.CreateReviewRequest;
import com.unilife.review.dto.response.ApiResponse;
import com.unilife.review.dto.response.ReviewResponse;
import com.unilife.review.model.ProductRating;
import com.unilife.review.service.IReviewService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/reviews")
@Tag(name = "Reviews", description = "Gestion des avis produits")
public class ReviewController {

    private final IReviewService reviewService;

    public ReviewController(IReviewService reviewService) {
        this.reviewService = reviewService;
    }

    @PostMapping
    @Operation(summary = "Soumettre un avis")
    public ResponseEntity<ApiResponse<ReviewResponse>> createReview(
            @Valid @RequestBody CreateReviewRequest request,
            @RequestHeader("X-User-Id") String userId) {
        ApiResponse<ReviewResponse> response = reviewService.createReview(userId, request);
        return ResponseEntity.status(response.isSuccess() ? HttpStatus.CREATED : HttpStatus.BAD_REQUEST)
                .body(response);
    }

    @GetMapping("/product/{productId}")
    @Operation(summary = "Avis approuves d un produit")
    public ResponseEntity<ApiResponse<List<ReviewResponse>>> getProductReviews(
            @PathVariable String productId) {
        return ResponseEntity.ok(reviewService.getProductReviews(productId));
    }

    @GetMapping("/my-reviews")
    @Operation(summary = "Mes avis")
    public ResponseEntity<ApiResponse<List<ReviewResponse>>> getMyReviews(
            @RequestHeader("X-User-Id") String userId) {
        return ResponseEntity.ok(reviewService.getMyReviews(userId));
    }

    @GetMapping("/pending")
    @Operation(summary = "Avis en attente de moderation (admin)")
    public ResponseEntity<ApiResponse<List<ReviewResponse>>> getPending() {
        return ResponseEntity.ok(reviewService.getPendingReviews());
    }

    @PutMapping("/{reviewId}/approve")
    @Operation(summary = "Approuver un avis (admin)")
    public ResponseEntity<ApiResponse<ReviewResponse>> approve(@PathVariable String reviewId) {
        return ResponseEntity.ok(reviewService.approveReview(reviewId));
    }

    @PutMapping("/{reviewId}/reject")
    @Operation(summary = "Rejeter un avis (admin)")
    public ResponseEntity<ApiResponse<ReviewResponse>> reject(@PathVariable String reviewId) {
        return ResponseEntity.ok(reviewService.rejectReview(reviewId));
    }

    @PostMapping("/{reviewId}/admin-response")
    @Operation(summary = "Repondre a un avis (admin)")
    public ResponseEntity<ApiResponse<ReviewResponse>> adminResponse(
            @PathVariable String reviewId,
            @Valid @RequestBody AdminResponseRequest request,
            @RequestHeader("X-User-Id") String adminId) {
        return ResponseEntity.ok(reviewService.addAdminResponse(reviewId, adminId, request));
    }

    @PostMapping("/{reviewId}/helpful")
    @Operation(summary = "Marquer un avis comme utile")
    public ResponseEntity<ApiResponse<ReviewResponse>> markHelpful(@PathVariable String reviewId) {
        return ResponseEntity.ok(reviewService.markHelpful(reviewId));
    }

    @GetMapping("/product/{productId}/rating")
    @Operation(summary = "Note moyenne d un produit")
    public ResponseEntity<ApiResponse<ProductRating>> getProductRating(
            @PathVariable String productId) {
        return ResponseEntity.ok(reviewService.getProductRating(productId));
    }
}