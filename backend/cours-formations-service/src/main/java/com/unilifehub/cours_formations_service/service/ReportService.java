package com.unilifehub.cours_formations_service.service;

import com.unilifehub.cours_formations_service.entity.Report;
import com.unilifehub.cours_formations_service.entity.Resource;
import com.unilifehub.cours_formations_service.repository.ReportRepository;
import com.unilifehub.cours_formations_service.repository.ResourceRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import java.util.List;

@Service
@RequiredArgsConstructor
public class ReportService {

    private final ReportRepository reportRepository;
    private final ResourceRepository resourceRepository;

    public Report reportResource(Integer userId, Integer resourceId, String reason) {
        if (reportRepository.existsByUserIdAndResourceId(userId, resourceId))
            throw new RuntimeException("Vous avez déjà signalé cette ressource");

        Resource resource = resourceRepository.findById(resourceId)
                .orElseThrow(() -> new RuntimeException("Ressource non trouvée"));

        Report report = Report.builder()
                .userId(userId)
                .resource(resource)
                .reason(reason)
                .isResolved(false)
                .build();
        return reportRepository.save(report);
    }

    public List<Report> getPendingReports() {
        return reportRepository.findByIsResolvedFalse();
    }

    public Report resolveReport(Integer reportId) {
        Report report = reportRepository.findById(reportId)
                .orElseThrow(() -> new RuntimeException("Signalement non trouvé"));
        report.setIsResolved(true);
        return reportRepository.save(report);
    }
}