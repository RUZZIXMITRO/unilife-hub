package com.unilife.review.repository;

import com.unilife.review.model.Review;
import com.unilife.review.model.ReviewStatus;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ReviewRepository extends MongoRepository<Review, String> {
    List<Review> findByProductIdAndStatus(String productId, ReviewStatus status);
    List<Review> findByUserId(String userId);
    List<Review> findByStatus(ReviewStatus status);
    Optional<Review> findByUserIdAndProductId(String userId, String productId);
    boolean existsByUserIdAndProductId(String userId, String productId);
    List<Review> findByProductIdOrderByCreatedAtDesc(String productId);
}