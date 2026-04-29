package com.unilifehub.socialservice.service;

import com.unilifehub.socialservice.dto.request.CreateReportRequest;
import com.unilifehub.socialservice.dto.response.ReportResponse;
import com.unilifehub.socialservice.entity.Report;
import com.unilifehub.socialservice.repository.ReportRepository;
import com.unilifehub.socialservice.repository.PostRepository;
import com.unilifehub.socialservice.repository.CommentRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
public class ReportService {

    @Autowired
    private ReportRepository reportRepository;

    @Autowired
    private PostRepository postRepository;

    @Autowired
    private CommentRepository commentRepository;

    // ===== ÉTUDIANT =====

    // Créer un signalement
    public ReportResponse createReport(String reporterId, CreateReportRequest request) {
        // Vérifier doublon
        if (reportRepository.existsByReporterIdAndContentIdAndContentType(
                reporterId, request.getContentId(), request.getContentType())) {
            throw new RuntimeException("Vous avez déjà signalé ce contenu");
        }

        Report report = Report.builder()
                .reporterId(reporterId)
                .contentId(request.getContentId())
                .contentType(request.getContentType())
                .reason(request.getReason())
                .reportedUserId(request.getReportedUserId())
                .status(Report.ReportStatus.PENDING)
                .build();

        return mapToDto(reportRepository.save(report));
    }

    // ===== ADMIN =====

    // Tous les signalements
    public List<ReportResponse> getAllReports() {
        return reportRepository.findAll()
                .stream()
                .map(this::mapToDto)
                .collect(Collectors.toList());
    }

    // Signalements par statut
    public List<ReportResponse> getReportsByStatus(Report.ReportStatus status) {
        return reportRepository.findByStatus(status)
                .stream()
                .map(this::mapToDto)
                .collect(Collectors.toList());
    }

    // Traiter un signalement (RESOLVED ou DISMISSED)
    public ReportResponse resolveReport(Long reportId, Report.ReportStatus newStatus) {
        Report report = reportRepository.findById(reportId)
                .orElseThrow(() -> new RuntimeException("Signalement introuvable"));

        if (report.getStatus() != Report.ReportStatus.PENDING) {
            throw new RuntimeException("Ce signalement a déjà été traité");
        }

        report.setStatus(newStatus);
        return mapToDto(reportRepository.save(report));
    }

    // Supprimer un signalement + contenu signalé
    @Transactional  // ✅ AJOUT Phase 3
    public void deleteReportAndContent(Long reportId) {
        Report report = reportRepository.findById(reportId)
                .orElseThrow(() -> new RuntimeException("Signalement introuvable"));

        // Supprimer le contenu signalé
        if (report.getContentType() == Report.ContentType.POST) {
            postRepository.findById(report.getContentId())
                    .ifPresent(post -> postRepository.delete(post));
        } else if (report.getContentType() == Report.ContentType.COMMENT) {
            commentRepository.findById(report.getContentId())
                    .ifPresent(comment -> commentRepository.delete(comment));
        }

        // Supprimer le signalement
        reportRepository.delete(report);
    }

    // Statistiques pour le dashboard admin
    public Map<String, Long> getReportStats() {
        return Map.of(
                "total",     reportRepository.count(),
                "pending",   reportRepository.countByStatus(Report.ReportStatus.PENDING),
                "resolved",  reportRepository.countByStatus(Report.ReportStatus.RESOLVED),
                "dismissed", reportRepository.countByStatus(Report.ReportStatus.DISMISSED)
        );
    }

    // Stats globales réseau social pour le dashboard admin
    public Map<String, Long> getSocialStats() {
        return Map.of(
                "totalReports",         reportRepository.count(),
                "pendingReports",       reportRepository.countByStatus(Report.ReportStatus.PENDING)
        );
    }

    private ReportResponse mapToDto(Report r) {
        return ReportResponse.builder()
                .id(r.getId())
                .reporterId(r.getReporterId())
                .reportedUserId(r.getReportedUserId())
                .contentId(r.getContentId())
                .contentType(r.getContentType())
                .reason(r.getReason())
                .status(r.getStatus())
                .createdAt(r.getCreatedAt())
                .build();
    }
}