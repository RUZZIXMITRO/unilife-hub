package com.unilifehub.socialservice.dto.response;

import lombok.*;

import java.time.LocalDateTime;

@Getter @Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class GroupMemberResponse {

    private Long userId;
    private String role;
    private String status;
    private LocalDateTime joinedAt;
}
