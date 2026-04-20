package com.unilifehub.socialservice.controller;

import com.unilifehub.socialservice.dto.request.CreateReportRequest;
import com.unilifehub.socialservice.dto.response.ReportResponse;
import com.unilifehub.socialservice.entity.Report;
import com.unilifehub.socialservice.service.ReportService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@CrossOrigin(origins = "*")
public class ReportController {

    @Autowired
    private ReportService reportService;

    // ===================================================
    // ENDPOINTS ÉTUDIANT
    // ===================================================

    // POST /api/social/reports — Signaler un contenu
    @PostMapping("/api/social/reports")
    public ResponseEntity<?> createReport(
            @Valid @RequestBody CreateReportRequest request,
            @RequestHeader("X-User-Id") Long userId) {
        try {
            ReportResponse dto = reportService.createReport(userId, request);
            return ResponseEntity.ok(Map.of(
                    "success", true,
                    "message", "Signalement envoyé avec succès",
                    "data", dto
            ));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of(
                    "success", false,
                    "message", e.getMessage()
            ));
        }
    }

    // ===================================================
    // ENDPOINTS ADMIN
    // ===================================================

    // GET /api/social/admin/reports — Tous les signalements
    @GetMapping("/api/social/admin/reports")
    public ResponseEntity<?> getAllReports(
            @RequestParam(required = false) String status) {
        try {
            List<ReportResponse> list;
            if (status != null) {
                Report.ReportStatus s = Report.ReportStatus.valueOf(status.toUpperCase());
                list = reportService.getReportsByStatus(s);
            } else {
                list = reportService.getAllReports();
            }
            return ResponseEntity.ok(Map.of(
                    "success", true,
                    "data", list
            ));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(Map.of(
                    "success", false,
                    "message", "Statut invalide. Valeurs : PENDING, RESOLVED, DISMISSED"
            ));
        }
    }

    // PUT /api/social/admin/reports/{id}/resolve — Traiter (RESOLVED)
    @PutMapping("/api/social/admin/reports/{id}/resolve")
    public ResponseEntity<?> resolveReport(@PathVariable Long id) {
        try {
            ReportResponse dto = reportService.resolveReport(id, Report.ReportStatus.RESOLVED);
            return ResponseEntity.ok(Map.of(
                    "success", true,
                    "message", "Signalement traité",
                    "data", dto
            ));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of(
                    "success", false,
                    "message", e.getMessage()
            ));
        }
    }

    // PUT /api/social/admin/reports/{id}/dismiss — Rejeter (DISMISSED)
    @PutMapping("/api/social/admin/reports/{id}/dismiss")
    public ResponseEntity<?> dismissReport(@PathVariable Long id) {
        try {
            ReportResponse dto = reportService.resolveReport(id, Report.ReportStatus.DISMISSED);
            return ResponseEntity.ok(Map.of(
                    "success", true,
                    "message", "Signalement rejeté",
                    "data", dto
            ));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of(
                    "success", false,
                    "message", e.getMessage()
            ));
        }
    }

    // DELETE /api/social/admin/reports/{id} — Supprimer signalement + contenu
    @DeleteMapping("/api/social/admin/reports/{id}")
    public ResponseEntity<?> deleteReportAndContent(@PathVariable Long id) {
        try {
            reportService.deleteReportAndContent(id);
            return ResponseEntity.ok(Map.of(
                    "success", true,
                    "message", "Signalement et contenu supprimés"
            ));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of(
                    "success", false,
                    "message", e.getMessage()
            ));
        }
    }

    // GET /api/social/admin/reports/stats — Stats signalements
    @GetMapping("/api/social/admin/reports/stats")
    public ResponseEntity<?> getReportStats() {
        Map<String, Long> stats = reportService.getReportStats();
        return ResponseEntity.ok(Map.of(
                "success", true,
                "data", stats
        ));
    }

    // GET /api/social/admin/stats — Stats globales réseau social
    @GetMapping("/api/social/admin/stats")
    public ResponseEntity<?> getSocialStats() {
        Map<String, Long> stats = reportService.getSocialStats();
        return ResponseEntity.ok(Map.of(
                "success", true,
                "data", stats
        ));
    }
}