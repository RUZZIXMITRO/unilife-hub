package com.unilifehub.cours_formations_service.service;

import com.unilifehub.cours_formations_service.dto.response.StatisticsResponse;
import com.unilifehub.cours_formations_service.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class StatisticsService {

    private final CourseRepository courseRepository;
    private final FormationRepository formationRepository;
    private final DownloadRepository downloadRepository;
    private final CategoryRepository categoryRepository;
    private final CommentRepository commentRepository;
    private final ReportRepository reportRepository;

    public StatisticsResponse getGlobalStats() {
        return StatisticsResponse.builder()
                .totalCourses(courseRepository.count())
                .totalFormations(formationRepository.count())
                .totalDownloads(downloadRepository.count())
                .totalCategories(categoryRepository.count())
                .totalComments(commentRepository.count())
                .pendingReports(reportRepository.findByIsResolvedFalse().size())
                .approvedCourses(
                        courseRepository.findByIsApprovedTrueOrderByResource_CreatedAtDesc().size())
                .build();
    }
}