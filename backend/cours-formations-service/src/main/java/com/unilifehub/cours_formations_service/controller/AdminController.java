package com.unilifehub.cours_formations_service.controller;

import com.unilifehub.cours_formations_service.dto.response.*;
import com.unilifehub.cours_formations_service.entity.Comment;
import com.unilifehub.cours_formations_service.service.*;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/admin")
@RequiredArgsConstructor
// @PreAuthorize("hasRole('ADMIN')")
public class AdminController {

    private final StatisticsService statisticsService;
    private final CourseService courseService;
    private final CommentService commentService;

    @GetMapping("/statistics")
    public ResponseEntity<ApiResponse<StatisticsResponse>> getStats() {
        return ResponseEntity.ok(ApiResponse.success(
                "Statistiques globales",
                statisticsService.getGlobalStats()));
    }

    @GetMapping("/courses/pending")
    public ResponseEntity<ApiResponse<List<CourseResponse>>> getPendingCourses() {
        return ResponseEntity.ok(ApiResponse.success(
                "Cours en attente",
                courseService.getPendingCourses()));
    }

    @GetMapping("/comments/reported")
    public ResponseEntity<ApiResponse<List<CommentResponse>>> getReportedComments() {
        List<CommentResponse> responses = commentService.getReportedComments()
                .stream().map(this::toCommentResponse).collect(Collectors.toList());
        return ResponseEntity.ok(ApiResponse.success("Commentaires signalés", responses));
    }

    @DeleteMapping("/comments/{commentId}")
    public ResponseEntity<ApiResponse<Void>> deleteComment(@PathVariable Integer commentId) {
        commentService.adminDeleteComment(commentId);
        return ResponseEntity.ok(ApiResponse.success("Commentaire supprimé", null));
    }

    private CommentResponse toCommentResponse(Comment c) {
        return CommentResponse.builder()
                .id(c.getId())
                .userId(c.getUserId())
                .userName(c.getUserName())
                .resourceId(c.getResource().getId())
                .content(c.getContent())
                .isReported(c.getIsReported())
                .createdAt(c.getCreatedAt())
                .updatedAt(c.getUpdatedAt())
                .build();
    }
}