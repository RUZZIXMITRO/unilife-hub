package com.unilife.review.service;

import com.unilife.review.dto.request.AdminResponseRequest;
import com.unilife.review.dto.request.CreateReviewRequest;
import com.unilife.review.dto.response.ApiResponse;
import com.unilife.review.dto.response.ReviewResponse;
import com.unilife.review.model.ProductRating;

import java.util.List;

public interface IReviewService {
    ApiResponse<ReviewResponse> createReview(String userId, CreateReviewRequest request);
    ApiResponse<List<ReviewResponse>> getProductReviews(String productId);
    ApiResponse<List<ReviewResponse>> getMyReviews(String userId);
    ApiResponse<List<ReviewResponse>> getPendingReviews();
    ApiResponse<ReviewResponse> approveReview(String reviewId);
    ApiResponse<ReviewResponse> rejectReview(String reviewId);
    ApiResponse<ReviewResponse> addAdminResponse(String reviewId, String adminId, AdminResponseRequest request);
    ApiResponse<ReviewResponse> markHelpful(String reviewId);
    ApiResponse<ProductRating> getProductRating(String productId);
}