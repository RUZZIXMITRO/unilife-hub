package com.unilifehub.socialservice.controller;

import com.unilifehub.socialservice.config.AuthUtils;
import com.unilifehub.socialservice.dto.request.CreateReportRequest;
import com.unilifehub.socialservice.dto.response.ApiResponse;
import com.unilifehub.socialservice.dto.response.ReportResponse;
import com.unilifehub.socialservice.entity.Report;
import com.unilifehub.socialservice.service.ReportService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/social")
public class ReportController {

    @Autowired
    private ReportService reportService;

    // ===================================================
    // ENDPOINTS ÉTUDIANT
    // ===================================================

    // POST /api/social/reports — Signaler un contenu
    @PostMapping("/reports")
    public ResponseEntity<ApiResponse<ReportResponse>> createReport(
            @Valid @RequestBody CreateReportRequest request,
            Authentication auth) {
        String userId = AuthUtils.getRequiredUserId(auth);
        ReportResponse dto = reportService.createReport(userId, request);
        return ResponseEntity.ok(ApiResponse.success("Signalement envoyé avec succès", dto));
    }

    // ===================================================
    // ENDPOINTS ADMIN
    // ===================================================

    // GET /api/social/admin/reports — Tous les signalements
    @GetMapping("/admin/reports")
    public ResponseEntity<ApiResponse<List<ReportResponse>>> getAllReports(
            @RequestParam(required = false) String status) {
        List<ReportResponse> list;
        if (status != null) {
            Report.ReportStatus s = Report.ReportStatus.valueOf(status.toUpperCase());
            list = reportService.getReportsByStatus(s);
        } else {
            list = reportService.getAllReports();
        }
        return ResponseEntity.ok(ApiResponse.success("Signalements récupérés", list));
    }

    // PUT /api/social/admin/reports/{id}/resolve — Traiter (RESOLVED)
    @PutMapping("/admin/reports/{id}/resolve")
    public ResponseEntity<ApiResponse<ReportResponse>> resolveReport(@PathVariable Long id) {
        ReportResponse dto = reportService.resolveReport(id, Report.ReportStatus.RESOLVED);
        return ResponseEntity.ok(ApiResponse.success("Signalement traité", dto));
    }

    // PUT /api/social/admin/reports/{id}/dismiss — Rejeter (DISMISSED)
    @PutMapping("/admin/reports/{id}/dismiss")
    public ResponseEntity<ApiResponse<ReportResponse>> dismissReport(@PathVariable Long id) {
        ReportResponse dto = reportService.resolveReport(id, Report.ReportStatus.DISMISSED);
        return ResponseEntity.ok(ApiResponse.success("Signalement rejeté", dto));
    }

    // DELETE /api/social/admin/reports/{id} — Supprimer signalement + contenu
    @DeleteMapping("/admin/reports/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteReportAndContent(@PathVariable Long id) {
        reportService.deleteReportAndContent(id);
        return ResponseEntity.ok(ApiResponse.success("Signalement et contenu supprimés"));
    }

    // GET /api/social/admin/reports/stats — Stats signalements
    @GetMapping("/admin/reports/stats")
    public ResponseEntity<ApiResponse<Map<String, Long>>> getReportStats() {
        Map<String, Long> stats = reportService.getReportStats();
        return ResponseEntity.ok(ApiResponse.success("Stats récupérées", stats));
    }

    // GET /api/social/admin/stats — Stats globales réseau social
    @GetMapping("/admin/stats")
    public ResponseEntity<ApiResponse<Map<String, Long>>> getSocialStats() {
        Map<String, Long> stats = reportService.getSocialStats();
        return ResponseEntity.ok(ApiResponse.success("Stats globales récupérées", stats));
    }
}