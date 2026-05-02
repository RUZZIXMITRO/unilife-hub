package com.unilifehub.cours_formations_service.dto.response;

import lombok.*;
import java.time.LocalDateTime;

@Getter @Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class LikeResponse {
    private Integer id;
    private String userId;
    private Integer resourceId;
    private LocalDateTime createdAt;
}