package com.unilife.review.dto.response;

import com.unilife.review.model.AdminResponse;
import java.time.LocalDateTime;
import java.util.List;

public class ReviewResponse {
    private String id;
    private String productId;
    private String userId;
    private String orderId;
    private int rating;
    private String comment;
    private List<String> images;
    private boolean isVerifiedPurchase;
    private int helpfulCount;
    private String status;
    private AdminResponse adminResponse;
    private LocalDateTime createdAt;

    public ReviewResponse() {}

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }
    public String getProductId() { return productId; }
    public void setProductId(String productId) { this.productId = productId; }
    public String getUserId() { return userId; }
    public void setUserId(String userId) { this.userId = userId; }
    public String getOrderId() { return orderId; }
    public void setOrderId(String orderId) { this.orderId = orderId; }
    public int getRating() { return rating; }
    public void setRating(int rating) { this.rating = rating; }
    public String getComment() { return comment; }
    public void setComment(String comment) { this.comment = comment; }
    public List<String> getImages() { return images; }
    public void setImages(List<String> images) { this.images = images; }
    public boolean isVerifiedPurchase() { return isVerifiedPurchase; }
    public void setVerifiedPurchase(boolean verifiedPurchase) { isVerifiedPurchase = verifiedPurchase; }
    public int getHelpfulCount() { return helpfulCount; }
    public void setHelpfulCount(int helpfulCount) { this.helpfulCount = helpfulCount; }
    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }
    public AdminResponse getAdminResponse() { return adminResponse; }
    public void setAdminResponse(AdminResponse adminResponse) { this.adminResponse = adminResponse; }
    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
}