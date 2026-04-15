package com.unilifehub.socialservice.controller;

import com.unilifehub.socialservice.dto.response.ApiResponse;
import com.unilifehub.socialservice.dto.response.NotificationResponse;
import com.unilifehub.socialservice.service.NotificationService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/social/notifications")
@CrossOrigin(origins = "http://localhost:4200")
public class NotificationController {

    @Autowired
    private NotificationService notificationService;

    // GET /api/social/notifications
    @GetMapping
    public ResponseEntity<ApiResponse<List<NotificationResponse>>> getNotifications(
            Authentication auth) {
        Long userId = (auth != null) ? (Long) auth.getPrincipal() : 0L;
        return ResponseEntity.ok(
                ApiResponse.success("Notifications récupérées",
                        notificationService.getNotifications(userId)));
    }

    // GET /api/social/notifications/unread-count
    @GetMapping("/unread-count")
    public ResponseEntity<ApiResponse<Integer>> getUnreadCount(
            Authentication auth) {
        Long userId = (auth != null) ? (Long) auth.getPrincipal() : 0L;
        return ResponseEntity.ok(
                ApiResponse.success("Compteur récupéré",
                        notificationService.countUnread(userId)));
    }

    // PUT /api/social/notifications/{id}/read
    @PutMapping("/{id}/read")
    public ResponseEntity<ApiResponse<Void>> markAsRead(
            @PathVariable Long id,
            Authentication auth) {
        Long userId = (auth != null) ? (Long) auth.getPrincipal() : 0L;
        notificationService.markAsRead(id, userId);
        return ResponseEntity.ok(ApiResponse.success("Notification lue"));
    }

    // PUT /api/social/notifications/read-all
    @PutMapping("/read-all")
    public ResponseEntity<ApiResponse<Void>> markAllAsRead(
            Authentication auth) {
        Long userId = (auth != null) ? (Long) auth.getPrincipal() : 0L;
        notificationService.markAllAsRead(userId);
        return ResponseEntity.ok(
                ApiResponse.success("Toutes les notifications lues"));
    }
}