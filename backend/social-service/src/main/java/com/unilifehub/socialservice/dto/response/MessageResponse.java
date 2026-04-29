package com.unilifehub.socialservice.dto.response;

import lombok.*;
import java.time.LocalDateTime;

@Getter @Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class MessageResponse {

    private Long id;
    private String senderId;     // ✅ Long → String
    private String receiverId;   // ✅ Long → String
    private Long conversationId; // ✅ AJOUT (pour BUG #2)
    private String content;
    private boolean isRead;
    private LocalDateTime createdAt;
}