package com.unilifehub.socialservice.controller;

import com.unilifehub.socialservice.config.AuthUtils;
import com.unilifehub.socialservice.dto.response.ApiResponse;
import com.unilifehub.socialservice.dto.response.ConversationResponse;
import com.unilifehub.socialservice.service.ConversationService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/social/conversations")
public class ConversationController {

    @Autowired
    private ConversationService conversationService;

    // POST /api/social/conversations/{userId}/start
    @PostMapping("/{userId}/start")
    public ResponseEntity<ApiResponse<ConversationResponse>> startConversation(
            @PathVariable String userId,
            Authentication auth) {
        String currentUserId = AuthUtils.getRequiredUserId(auth);
        return ResponseEntity.ok(
                ApiResponse.success("Conversation prête",
                        conversationService.startOrGetConversation(currentUserId, userId)));
    }

    // GET /api/social/conversations
    @GetMapping
    public ResponseEntity<ApiResponse<List<ConversationResponse>>> getMyConversations(
            Authentication auth) {
        String userId = AuthUtils.getRequiredUserId(auth);
        return ResponseEntity.ok(
                ApiResponse.success("Conversations récupérées",
                        conversationService.getMyConversations(userId)));
    }
}