package com.unilife.review.service.impl;

import com.unilife.review.dto.request.AdminResponseRequest;
import com.unilife.review.dto.request.CreateReviewRequest;
import com.unilife.review.dto.response.ApiResponse;
import com.unilife.review.dto.response.ReviewResponse;
import com.unilife.review.model.AdminResponse;
import com.unilife.review.model.ProductRating;
import com.unilife.review.model.Review;
import com.unilife.review.model.ReviewStatus;
import com.unilife.review.repository.ProductRatingRepository;
import com.unilife.review.repository.ReviewRepository;
import com.unilife.review.service.IReviewService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
public class ReviewServiceImpl implements IReviewService {

    private static final Logger log = LoggerFactory.getLogger(ReviewServiceImpl.class);

    private final ReviewRepository reviewRepository;
    private final ProductRatingRepository ratingRepository;

    public ReviewServiceImpl(ReviewRepository reviewRepository,
                              ProductRatingRepository ratingRepository) {
        this.reviewRepository = reviewRepository;
        this.ratingRepository = ratingRepository;
    }

    @Override
    public ApiResponse<ReviewResponse> createReview(String userId, CreateReviewRequest request) {
        if (reviewRepository.existsByUserIdAndProductId(userId, request.getProductId())) {
            return ApiResponse.error("Vous avez deja laisse un avis pour ce produit");
        }

        Review review = new Review();
        review.setUserId(userId);
        review.setProductId(request.getProductId());
        review.setOrderId(request.getOrderId());
        review.setRating(request.getRating());
        review.setComment(request.getComment());
        review.setImages(request.getImages());
        review.setVerifiedPurchase(request.getOrderId() != null);
        review.setStatus(ReviewStatus.Pending);
        review.setCreatedAt(LocalDateTime.now());
        review.setUpdatedAt(LocalDateTime.now());

        review = reviewRepository.save(review);
        log.info("Avis cree pour produit {} par utilisateur {}", request.getProductId(), userId);

        return ApiResponse.success("Avis soumis — en attente de moderation", toResponse(review));
    }

    @Override
    public ApiResponse<List<ReviewResponse>> getProductReviews(String productId) {
        List<Review> reviews = reviewRepository.findByProductIdAndStatus(productId, ReviewStatus.Approved);
        return ApiResponse.success("Avis du produit", reviews.stream().map(this::toResponse).collect(Collectors.toList()));
    }

    @Override
    public ApiResponse<List<ReviewResponse>> getMyReviews(String userId) {
        List<Review> reviews = reviewRepository.findByUserId(userId);
        return ApiResponse.success("Mes avis", reviews.stream().map(this::toResponse).collect(Collectors.toList()));
    }

    @Override
    public ApiResponse<List<ReviewResponse>> getPendingReviews() {
        List<Review> reviews = reviewRepository.findByStatus(ReviewStatus.Pending);
        return ApiResponse.success("Avis en attente", reviews.stream().map(this::toResponse).collect(Collectors.toList()));
    }

    @Override
    public ApiResponse<ReviewResponse> approveReview(String reviewId) {
        Review review = reviewRepository.findById(reviewId)
                .orElse(null);
        if (review == null) return ApiResponse.error("Avis introuvable");

        review.setStatus(ReviewStatus.Approved);
        review.setUpdatedAt(LocalDateTime.now());
        review = reviewRepository.save(review);

        // Recalculer la note moyenne du produit
        updateProductRating(review.getProductId());

        return ApiResponse.success("Avis approuve", toResponse(review));
    }

    @Override
    public ApiResponse<ReviewResponse> rejectReview(String reviewId) {
        Review review = reviewRepository.findById(reviewId).orElse(null);
        if (review == null) return ApiResponse.error("Avis introuvable");

        review.setStatus(ReviewStatus.Rejected);
        review.setUpdatedAt(LocalDateTime.now());
        review = reviewRepository.save(review);
        return ApiResponse.success("Avis rejete", toResponse(review));
    }

    @Override
    public ApiResponse<ReviewResponse> addAdminResponse(String reviewId, String adminId,
                                                          AdminResponseRequest request) {
        Review review = reviewRepository.findById(reviewId).orElse(null);
        if (review == null) return ApiResponse.error("Avis introuvable");

        review.setAdminResponse(new AdminResponse(adminId, request.getResponse()));
        review.setUpdatedAt(LocalDateTime.now());
        review = reviewRepository.save(review);
        return ApiResponse.success("Reponse admin ajoutee", toResponse(review));
    }

    @Override
    public ApiResponse<ReviewResponse> markHelpful(String reviewId) {
        Review review = reviewRepository.findById(reviewId).orElse(null);
        if (review == null) return ApiResponse.error("Avis introuvable");

        review.setHelpfulCount(review.getHelpfulCount() + 1);
        review = reviewRepository.save(review);
        return ApiResponse.success("Merci pour votre vote", toResponse(review));
    }

    @Override
    public ApiResponse<ProductRating> getProductRating(String productId) {
        ProductRating rating = ratingRepository.findByProductId(productId)
                .orElse(new ProductRating());
        rating.setProductId(productId);
        return ApiResponse.success("Note du produit", rating);
    }

    private void updateProductRating(String productId) {
        List<Review> approved = reviewRepository.findByProductIdAndStatus(productId, ReviewStatus.Approved);
        if (approved.isEmpty()) return;

        double avg = approved.stream().mapToInt(Review::getRating).average().orElse(0);
        Map<Integer, Integer> distribution = new HashMap<>();
        for (int i = 1; i <= 5; i++) {
            int star = i;
            distribution.put(i, (int) approved.stream().filter(r -> r.getRating() == star).count());
        }

        ProductRating rating = ratingRepository.findByProductId(productId)
                .orElse(new ProductRating());
        rating.setProductId(productId);
        rating.setAverageRating(Math.round(avg * 10.0) / 10.0);
        rating.setTotalReviews(approved.size());
        rating.setRatingDistribution(distribution);
        ratingRepository.save(rating);
    }

    private ReviewResponse toResponse(Review review) {
        ReviewResponse response = new ReviewResponse();
        response.setId(review.getId());
        response.setProductId(review.getProductId());
        response.setUserId(review.getUserId());
        response.setOrderId(review.getOrderId());
        response.setRating(review.getRating());
        response.setComment(review.getComment());
        response.setImages(review.getImages());
        response.setVerifiedPurchase(review.isVerifiedPurchase());
        response.setHelpfulCount(review.getHelpfulCount());
        response.setStatus(review.getStatus().toString());
        response.setAdminResponse(review.getAdminResponse());
        response.setCreatedAt(review.getCreatedAt());
        return response;
    }
}