package com.unilifehub.socialservice.dto.response;

import java.time.LocalDateTime;

public record ConversationResponse(
        Long id,
        String user1Id,         // ✅ Long → String
        String user2Id,         // ✅ Long → String
        String lastMessage,
        LocalDateTime lastMessageAt,
        LocalDateTime createdAt,
        LocalDateTime updatedAt
) {}