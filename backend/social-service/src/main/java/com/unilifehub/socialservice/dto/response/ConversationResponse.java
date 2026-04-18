package com.unilifehub.socialservice.dto.response;

import java.time.LocalDateTime;

public class ConversationResponse {

    private Long id;
    private Long user1Id;
    private Long user2Id;
    private String lastMessage;
    private LocalDateTime lastMessageAt;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    public ConversationResponse() {}

    public ConversationResponse(Long id, Long user1Id, Long user2Id,
                                String lastMessage, LocalDateTime lastMessageAt,
                                LocalDateTime createdAt, LocalDateTime updatedAt) {
        this.id = id;
        this.user1Id = user1Id;
        this.user2Id = user2Id;
        this.lastMessage = lastMessage;
        this.lastMessageAt = lastMessageAt;
        this.createdAt = createdAt;
        this.updatedAt = updatedAt;
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public Long getUser1Id() { return user1Id; }
    public void setUser1Id(Long user1Id) { this.user1Id = user1Id; }

    public Long getUser2Id() { return user2Id; }
    public void setUser2Id(Long user2Id) { this.user2Id = user2Id; }

    public String getLastMessage() { return lastMessage; }
    public void setLastMessage(String lastMessage) { this.lastMessage = lastMessage; }

    public LocalDateTime getLastMessageAt() { return lastMessageAt; }
    public void setLastMessageAt(LocalDateTime lastMessageAt) { this.lastMessageAt = lastMessageAt; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }

    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }
}