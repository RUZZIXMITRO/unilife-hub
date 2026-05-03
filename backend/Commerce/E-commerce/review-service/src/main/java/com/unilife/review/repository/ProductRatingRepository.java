package com.unilife.review.repository;

import com.unilife.review.model.ProductRating;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface ProductRatingRepository extends MongoRepository<ProductRating, String> {
    Optional<ProductRating> findByProductId(String productId);
}