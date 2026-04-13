package com.unilifehub.socialservice.dto.response;

import lombok.*;
import java.time.LocalDateTime;

@Getter @Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class FriendshipResponse {

    private Long id;
    private Long requesterId;
    private Long addresseeId;
    private String status;
    private LocalDateTime createdAt;
}