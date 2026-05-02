package com.unilifehub.cours_formations_service.dto.response;

import lombok.*;
import java.time.LocalDateTime;

@Getter @Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CommentResponse {
    private Integer id;
    private String userId;
    private String userName;
    private Integer resourceId;
    private String content;
    private Boolean isReported;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}