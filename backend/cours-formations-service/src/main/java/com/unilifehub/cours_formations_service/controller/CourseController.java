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
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import java.util.List;

@RestController
@RequestMapping("/api/courses")
@RequiredArgsConstructor
public class CourseController {

    private final CourseService courseService;

    private String getUserId(String userIdHeader) {
        if (userIdHeader == null) {
            var auth = SecurityContextHolder.getContext().getAuthentication();
            if (auth != null && !auth.getPrincipal().equals("anonymousUser"))
                return auth.getPrincipal().toString();
            throw new RuntimeException("Utilisateur non authentifié");
        }
        return userIdHeader;
    }

    @GetMapping
    public ResponseEntity<ApiResponse<List<CourseResponse>>> getAllCourses(
            @RequestHeader(value = "X-User-Id", required = false) String userId) {
        return ResponseEntity.ok(ApiResponse.success("Cours récupérés", courseService.getAllCourses(userId)));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<CourseResponse>> getCourseById(
            @PathVariable Integer id,
            @RequestHeader(value = "X-User-Id", required = false) String userId) {
        return ResponseEntity.ok(ApiResponse.success("Cours récupéré", courseService.getCourseById(id, userId)));
    }

    @GetMapping("/search")
    public ResponseEntity<ApiResponse<List<CourseResponse>>> searchCourses(
            @RequestParam(required = false) String keyword,
            @RequestParam(required = false) Integer categoryId,
            @RequestHeader(value = "X-User-Id", required = false) String userId) {
        return ResponseEntity.ok(ApiResponse.success("Résultats", courseService.searchCourses(keyword, categoryId, userId)));
    }

    @PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<ApiResponse<CourseResponse>> uploadCourse(
            @Valid @RequestPart("data") CourseRequest request,
            @RequestPart("file") MultipartFile file,
            @RequestHeader(value = "X-User-Id", required = false) String userId) {
        return ResponseEntity.ok(ApiResponse.success("Cours uploadé",
                courseService.uploadCourse(request, file, getUserId(userId))));
    }

    @GetMapping("/{id}/download")
    public ResponseEntity<ApiResponse<String>> downloadCourse(
            @PathVariable Integer id,
            @RequestHeader(value = "X-User-Id", required = false) String userId) {
        return ResponseEntity.ok(ApiResponse.success("URL",
                courseService.downloadCourse(id, getUserId(userId))));
    }

    @GetMapping("/my-courses")
    public ResponseEntity<ApiResponse<List<CourseResponse>>> getMyCourses(
            @RequestHeader(value = "X-User-Id", required = false) String userId) {
        return ResponseEntity.ok(ApiResponse.success("Mes cours",
                courseService.getMyCourses(getUserId(userId))));
    }

    @PatchMapping("/{id}/approve")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<CourseResponse>> approveCourse(@PathVariable Integer id) {
        return ResponseEntity.ok(ApiResponse.success("Cours approuvé", courseService.approveCourse(id)));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteCourse(@PathVariable Integer id) {
        courseService.deleteCourse(id);
        return ResponseEntity.ok(ApiResponse.success("Cours supprimé", null));
    }
}