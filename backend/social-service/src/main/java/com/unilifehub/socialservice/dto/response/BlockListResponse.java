package com.unilifehub.socialservice.dto.response;

import java.time.LocalDateTime;

public class BlockListResponse {

    private Long id;
    private String blockerId;  // ✅ Long → String
    private String blockedId;  // ✅ Long → String
    private LocalDateTime blockedAt;

    public BlockListResponse() {}

    public BlockListResponse(Long id, String blockerId,
                             String blockedId, LocalDateTime blockedAt) {
        this.id = id;
        this.blockerId = blockerId;
        this.blockedId = blockedId;
        this.blockedAt = blockedAt;
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getBlockerId() { return blockerId; }
    public void setBlockerId(String blockerId) { this.blockerId = blockerId; }

    public String getBlockedId() { return blockedId; }
    public void setBlockedId(String blockedId) { this.blockedId = blockedId; }

    public LocalDateTime getBlockedAt() { return blockedAt; }
    public void setBlockedAt(LocalDateTime blockedAt) { this.blockedAt = blockedAt; }
}