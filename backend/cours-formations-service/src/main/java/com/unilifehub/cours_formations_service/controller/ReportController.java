package com.unilifehub.cours_formations_service.controller;

import com.unilifehub.cours_formations_service.dto.request.ReportRequest;
import com.unilifehub.cours_formations_service.dto.response.ApiResponse;
import com.unilifehub.cours_formations_service.dto.response.ReportResponse;
import com.unilifehub.cours_formations_service.entity.Report;
import com.unilifehub.cours_formations_service.service.ReportService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/reports")
@RequiredArgsConstructor
public class ReportController {

    private final ReportService reportService;

    @PostMapping("/resource/{resourceId}")
    public ResponseEntity<ApiResponse<ReportResponse>> reportResource(
            @PathVariable Integer resourceId,
            @Valid @RequestBody ReportRequest request,
            @RequestHeader("X-User-Id") String userId) {
        Report report = reportService.reportResource(
                Integer.parseInt(userId), resourceId, request.getReason());
        return ResponseEntity.ok(ApiResponse.success("Ressource signalée", toResponse(report)));
    }

    @GetMapping("/pending")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<List<ReportResponse>>> getPendingReports() {
        List<ReportResponse> responses = reportService.getPendingReports()
                .stream().map(this::toResponse).collect(Collectors.toList());
        return ResponseEntity.ok(ApiResponse.success("Signalements en attente", responses));
    }

    @PatchMapping("/{reportId}/resolve")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<ReportResponse>> resolveReport(
            @PathVariable Integer reportId) {
        return ResponseEntity.ok(ApiResponse.success(
                "Signalement résolu",
                toResponse(reportService.resolveReport(reportId))));
    }

    private ReportResponse toResponse(Report r) {
        return ReportResponse.builder()
                .id(r.getId())
                .userId(r.getUserId())
                .resourceId(r.getResource().getId())
                .reason(r.getReason())
                .isResolved(r.getIsResolved())
                .createdAt(r.getCreatedAt())
                .build();
    }
}