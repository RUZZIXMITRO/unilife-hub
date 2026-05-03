package com.unilifehub.cours_formations_service.dto.response;

import lombok.*;

@Getter @Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class StatisticsResponse {
    private Long totalCourses;
    private Long totalFormations;
    private Long totalDownloads;
    private Long totalCategories;
    private Long totalComments;
    private Integer pendingReports;
    private Integer approvedCourses;
}