package com.unilifehub.socialservice.dto.response;

import lombok.*;
import java.time.LocalDateTime;

@Getter @Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class NotificationResponse {

    private Long id;
    private Long userId;
    private Long relatedUserId;
    private String type;
    private String message;
    private Long referenceId;
    private boolean isRead;
    private LocalDateTime createdAt;
}