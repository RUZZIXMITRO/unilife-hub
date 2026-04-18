package com.unilifehub.socialservice.dto.response;

import java.time.LocalDateTime;

public class BlockListResponse {

    private Long id;
    private Long blockerId;
    private Long blockedId;
    private LocalDateTime blockedAt;

    public BlockListResponse() {}

    public BlockListResponse(Long id, Long blockerId,
                             Long blockedId, LocalDateTime blockedAt) {
        this.id = id;
        this.blockerId = blockerId;
        this.blockedId = blockedId;
        this.blockedAt = blockedAt;
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public Long getBlockerId() { return blockerId; }
    public void setBlockerId(Long blockerId) { this.blockerId = blockerId; }

    public Long getBlockedId() { return blockedId; }
    public void setBlockedId(Long blockedId) { this.blockedId = blockedId; }

    public LocalDateTime getBlockedAt() { return blockedAt; }
    public void setBlockedAt(LocalDateTime blockedAt) { this.blockedAt = blockedAt; }
}