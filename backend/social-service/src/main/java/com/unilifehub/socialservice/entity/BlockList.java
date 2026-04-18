package com.unilifehub.socialservice.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "block_list",
        uniqueConstraints = @UniqueConstraint(columnNames = {"blocker_id", "blocked_id"}))
public class BlockList {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "blocker_id", nullable = false)
    private Long blockerId;

    @Column(name = "blocked_id", nullable = false)
    private Long blockedId;

    @Column(name = "blocked_at")
    private LocalDateTime blockedAt;

    @PrePersist
    protected void onCreate() {
        blockedAt = LocalDateTime.now();
    }

    // Getters & Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public Long getBlockerId() { return blockerId; }
    public void setBlockerId(Long blockerId) { this.blockerId = blockerId; }

    public Long getBlockedId() { return blockedId; }
    public void setBlockedId(Long blockedId) { this.blockedId = blockedId; }

    public LocalDateTime getBlockedAt() { return blockedAt; }
    public void setBlockedAt(LocalDateTime blockedAt) { this.blockedAt = blockedAt; }
}