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

    @Column(name = "blocker_id", nullable = false, length = 36)
    private String blockerId;

    @Column(name = "blocked_id", nullable = false, length = 36)
    private String blockedId;

    @Column(name = "blocked_at")
    private LocalDateTime blockedAt;

    @PrePersist
    protected void onCreate() {
        blockedAt = LocalDateTime.now();
    }

    // Getters & Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getBlockerId() { return blockerId; }
    public void setBlockerId(String blockerId) { this.blockerId = blockerId; }

    public String getBlockedId() { return blockedId; }
    public void setBlockedId(String blockedId) { this.blockedId = blockedId; }

    public LocalDateTime getBlockedAt() { return blockedAt; }
    public void setBlockedAt(LocalDateTime blockedAt) { this.blockedAt = blockedAt; }
}