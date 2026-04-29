package com.unilifehub.socialservice.controller;

import com.unilifehub.socialservice.config.AuthUtils;
import com.unilifehub.socialservice.dto.request.SendMessageRequest;
import com.unilifehub.socialservice.dto.response.ApiResponse;
import com.unilifehub.socialservice.dto.response.MessageResponse;
import com.unilifehub.socialservice.service.MessageService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/social/messages")
public class MessageController {

    @Autowired
    private MessageService messageService;

    // GET /api/social/messages/{userId} → conversation
    @GetMapping("/{userId}")
    public ResponseEntity<ApiResponse<List<MessageResponse>>> getConversation(
            @PathVariable String userId,
            Authentication auth) {
        String currentUserId = AuthUtils.getRequiredUserId(auth);
        return ResponseEntity.ok(
                ApiResponse.success("Conversation récupérée",
                        messageService.getConversation(currentUserId, userId)));
    }

    // POST /api/social/messages → envoyer message
    @PostMapping
    public ResponseEntity<ApiResponse<MessageResponse>> sendMessage(
            @Valid @RequestBody SendMessageRequest request,
            Authentication auth) {
        String userId = AuthUtils.getRequiredUserId(auth);
        return ResponseEntity.ok(
                ApiResponse.success("Message envoyé",
                        messageService.sendMessage(userId, request)));
    }

    // PUT /api/social/messages/{id}/read → marquer lu
    @PutMapping("/{id}/read")
    public ResponseEntity<ApiResponse<Void>> markAsRead(
            @PathVariable Long id,
            Authentication auth) {
        String userId = AuthUtils.getRequiredUserId(auth);
        messageService.markAsRead(id, userId);
        return ResponseEntity.ok(ApiResponse.success("Message lu"));
    }
}