package com.unilifehub.socialservice.dto.response;

import lombok.*;
import java.time.LocalDateTime;

@Getter @Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class FriendshipResponse {

    private Long id;
    private String requesterId;  // ✅ Long → String
    private String addresseeId;  // ✅ Long → String
    private String status;
    private LocalDateTime createdAt;
}