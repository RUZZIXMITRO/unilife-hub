package com.unilifehub.cours_formations_service.controller;

import com.unilifehub.cours_formations_service.dto.request.FormationRequest;
import com.unilifehub.cours_formations_service.dto.response.ApiResponse;
import com.unilifehub.cours_formations_service.dto.response.FormationResponse;
import com.unilifehub.cours_formations_service.service.FormationService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/formations")
@RequiredArgsConstructor
public class FormationController {

    private final FormationService formationService;

    @GetMapping
    public ResponseEntity<ApiResponse<List<FormationResponse>>> getAllFormations(
            @RequestHeader(value = "X-User-Id", required = false) String userId) {
        Integer uid = userId != null ? Integer.parseInt(userId) : null;
        return ResponseEntity.ok(ApiResponse.success(
                "Formations récupérées",
                formationService.getAllFormations(uid)));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<FormationResponse>> getFormationById(
            @PathVariable Integer id,
            @RequestHeader(value = "X-User-Id", required = false) String userId) {
        Integer uid = userId != null ? Integer.parseInt(userId) : null;
        return ResponseEntity.ok(ApiResponse.success(
                "Formation récupérée",
                formationService.getFormationById(id, uid)));
    }

    @GetMapping("/search")
    public ResponseEntity<ApiResponse<List<FormationResponse>>> searchFormations(
            @RequestParam(required = false) String keyword,
            @RequestParam(required = false) String level,
            @RequestParam(required = false) String language,
            @RequestParam(required = false) Integer categoryId,
            @RequestHeader(value = "X-User-Id", required = false) String userId) {
        Integer uid = userId != null ? Integer.parseInt(userId) : null;
        return ResponseEntity.ok(ApiResponse.success(
                "Résultats de recherche",
                formationService.searchFormations(keyword, level, language, categoryId, uid)));
    }

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<FormationResponse>> createFormation(
            @Valid @RequestBody FormationRequest request) {
        return ResponseEntity.ok(ApiResponse.success(
                "Formation créée",
                formationService.createFormation(request)));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<FormationResponse>> updateFormation(
            @PathVariable Integer id,
            @Valid @RequestBody FormationRequest request) {
        return ResponseEntity.ok(ApiResponse.success(
                "Formation mise à jour",
                formationService.updateFormation(id, request)));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<Void>> deleteFormation(@PathVariable Integer id) {
        formationService.deleteFormation(id);
        return ResponseEntity.ok(ApiResponse.success("Formation supprimée", null));
    }

    @PostMapping("/{id}/click")
    public ResponseEntity<ApiResponse<Void>> incrementClicks(@PathVariable Integer id) {
        formationService.incrementClicks(id);
        return ResponseEntity.ok(ApiResponse.success("Clic enregistré", null));
    }
}