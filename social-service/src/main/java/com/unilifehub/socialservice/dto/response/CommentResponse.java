package com.unilifehub.socialservice.dto.response;

import lombok.*;
import java.time.LocalDateTime;

@Getter @Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CommentResponse {

    private Long id;
    private Long userId;
    private String userName;
    private String content;
    private Long parentCommentId;
    private Long postId;
    private LocalDateTime createdAt;
}