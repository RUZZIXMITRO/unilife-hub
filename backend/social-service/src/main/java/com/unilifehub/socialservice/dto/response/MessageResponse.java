package com.unilifehub.socialservice.dto.response;

import lombok.*;
import java.time.LocalDateTime;

@Getter @Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class MessageResponse {

    private Long id;
    private Long senderId;
    private Long receiverId;
    private String content;
    private boolean isRead;
    private LocalDateTime createdAt;
}