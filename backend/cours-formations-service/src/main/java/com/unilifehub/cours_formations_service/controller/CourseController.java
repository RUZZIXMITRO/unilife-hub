package com.unilifehub.cours_formations_service.controller;

import com.unilifehub.cours_formations_service.dto.request.CourseRequest;
import com.unilifehub.cours_formations_service.dto.response.ApiResponse;
import com.unilifehub.cours_formations_service.dto.response.CourseResponse;
import com.unilifehub.cours_formations_service.service.CourseService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import java.util.List;

@RestController
@RequestMapping("/api/courses")
@RequiredArgsConstructor
public class CourseController {

    private final CourseService courseService;

    @GetMapping
    public ResponseEntity<ApiResponse<List<CourseResponse>>> getAllCourses(
            @RequestHeader(value = "X-User-Id", required = false) String userId) {
        return ResponseEntity.ok(ApiResponse.success(
                "Cours récupérés",
                courseService.getAllCourses(userId)));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<CourseResponse>> getCourseById(
            @PathVariable Integer id,
            @RequestHeader(value = "X-User-Id", required = false) String userId) {
        return ResponseEntity.ok(ApiResponse.success(
                "Cours récupéré",
                courseService.getCourseById(id, userId)));
    }

    @GetMapping("/search")
    public ResponseEntity<ApiResponse<List<CourseResponse>>> searchCourses(
            @RequestParam(required = false) String keyword,
            @RequestParam(required = false) Integer categoryId,
            @RequestHeader(value = "X-User-Id", required = false) String userId) {
        return ResponseEntity.ok(ApiResponse.success(
                "Résultats de recherche",
                courseService.searchCourses(keyword, categoryId, userId)));
    }

    @PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<ApiResponse<CourseResponse>> uploadCourse(
            @Valid @RequestPart("data") CourseRequest request,
            @RequestPart("file") MultipartFile file,
            @RequestHeader("X-User-Id") String userId) {
        return ResponseEntity.ok(ApiResponse.success(
                "Cours uploadé avec succès",
                courseService.uploadCourse(request, file, userId)));
    }

    @GetMapping("/{id}/download")
    public ResponseEntity<ApiResponse<String>> downloadCourse(
            @PathVariable Integer id,
            @RequestHeader("X-User-Id") String userId) {
        String fileUrl = courseService.downloadCourse(id, userId);
        return ResponseEntity.ok(ApiResponse.success("URL de téléchargement", fileUrl));
    }

    @GetMapping("/my-courses")
    public ResponseEntity<ApiResponse<List<CourseResponse>>> getMyCourses(
            @RequestHeader("X-User-Id") String userId) {
        return ResponseEntity.ok(ApiResponse.success(
                "Mes cours",
                courseService.getMyCourses(userId)));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<CourseResponse>> updateCourse(
            @PathVariable Integer id,
            @RequestBody CourseRequest request,
            @RequestHeader("X-User-Id") String userId) {
        return ResponseEntity.ok(ApiResponse.success(
                "Cours mis à jour",
                courseService.updateCourse(id, request, userId)));
    }

    @DeleteMapping("/{id}/my-course")
    public ResponseEntity<ApiResponse<Void>> deleteMyCourse(
            @PathVariable Integer id,
            @RequestHeader("X-User-Id") String userId) {
        courseService.deleteMyCourse(id, userId);
        return ResponseEntity.ok(ApiResponse.success("Cours supprimé", null));
    }

    @PatchMapping("/{id}/approve")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<CourseResponse>> approveCourse(
            @PathVariable Integer id) {
        return ResponseEntity.ok(ApiResponse.success(
                "Cours approuvé",
                courseService.approveCourse(id)));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<Void>> deleteCourse(@PathVariable Integer id) {
        courseService.deleteCourse(id);
        return ResponseEntity.ok(ApiResponse.success("Cours supprimé", null));
    }
}