package com.unilifehub.cours_formations_service.dto.response;

import lombok.*;
import java.time.LocalDateTime;

@Getter @Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ReportResponse {
    private Integer id;
    private String userId;
    private Integer resourceId;
    private String reason;
    private Boolean isResolved;
    private LocalDateTime createdAt;
}