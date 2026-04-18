package com.unilifehub.socialservice.dto.response;

import java.time.LocalDateTime;

public class ShareResponse {

    private Long id;
    private Long postId;
    private Long userId;
    private LocalDateTime createdAt;
    private long shareCount;

    public ShareResponse() {}

    public ShareResponse(Long id, Long postId, Long userId,
                         LocalDateTime createdAt, long shareCount) {
        this.id = id;
        this.postId = postId;
        this.userId = userId;
        this.createdAt = createdAt;
        this.shareCount = shareCount;
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public Long getPostId() { return postId; }
    public void setPostId(Long postId) { this.postId = postId; }

    public Long getUserId() { return userId; }
    public void setUserId(Long userId) { this.userId = userId; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }

    public long getShareCount() { return shareCount; }
    public void setShareCount(long shareCount) { this.shareCount = shareCount; }
}