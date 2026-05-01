package com.unilife.review.model;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import org.springframework.data.mongodb.core.index.Indexed;
import java.util.Map;

/**
 * Note moyenne d un produit.
 * Document separe pour un acces rapide sans recalculer.
 * SOLID - S : responsabilite unique = stocker la note agregee.
 */
@Document(collection = "product_ratings")
public class ProductRating {

    @Id
    private String id;

    @Indexed(unique = true)
    private String productId;

    private double averageRating;
    private int totalReviews;
    private Map<Integer, Integer> ratingDistribution; // {1:5, 2:3, 3:10, 4:25, 5:50}

    public ProductRating() {}

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }
    public String getProductId() { return productId; }
    public void setProductId(String productId) { this.productId = productId; }
    public double getAverageRating() { return averageRating; }
    public void setAverageRating(double averageRating) { this.averageRating = averageRating; }
    public int getTotalReviews() { return totalReviews; }
    public void setTotalReviews(int totalReviews) { this.totalReviews = totalReviews; }
    public Map<Integer, Integer> getRatingDistribution() { return ratingDistribution; }
    public void setRatingDistribution(Map<Integer, Integer> ratingDistribution) { this.ratingDistribution = ratingDistribution; }
}