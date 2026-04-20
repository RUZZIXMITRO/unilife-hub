package com.unilifehub.socialservice.dto.response;

import com.unilifehub.socialservice.entity.Report;
import java.time.LocalDateTime;

@lombok.Data
@lombok.NoArgsConstructor
@lombok.AllArgsConstructor
@lombok.Builder
public class ReportResponse {

    private Long id;
    private Long reporterId;
    private Long reportedUserId;
    private Long contentId;
    private Report.ContentType contentType;
    private String reason;
    private Report.ReportStatus status;
    private LocalDateTime createdAt;
}