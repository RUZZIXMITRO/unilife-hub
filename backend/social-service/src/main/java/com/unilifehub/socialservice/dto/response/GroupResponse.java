package com.unilifehub.socialservice.dto.response;

import lombok.*;
import java.time.LocalDateTime;

@Getter @Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class GroupResponse {

    private Long id;
    private String name;
    private String description;
    private String subject;
    private String creatorId;  // ✅ Long → String
    private String type;
    private int membersCount;
    private boolean isMember;   // est-ce que l'utilisateur connecté est membre ?
    private LocalDateTime createdAt;
}