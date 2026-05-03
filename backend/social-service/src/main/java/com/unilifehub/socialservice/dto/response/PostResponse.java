package com.unilifehub.socialservice.dto.response;

import lombok.*;
import java.time.LocalDateTime;

@Getter @Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PostResponse {

    private Long id;
    private String userId;      // ✅ Long → String
    private String userAvatar;  // ✅ AJOUTER
    private String userName;    // récupéré depuis UserService
    private String content;
    private String visibility;
    private int likesCount;
    private int commentsCount;
    private boolean likedByMe;  // est-ce que l'utilisateur connecté a liké ?
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}