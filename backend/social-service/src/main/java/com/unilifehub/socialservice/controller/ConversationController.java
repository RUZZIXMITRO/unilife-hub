package com.unilifehub.socialservice.controller;
import com.unilifehub.socialservice.dto.response.ConversationResponse;
import com.unilifehub.socialservice.service.ConversationService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/social/conversations")
@CrossOrigin(origins = "*")
public class ConversationController {

    @Autowired
    private ConversationService conversationService;

    // POST /api/social/conversations/{userId}/start
    @PostMapping("/{userId}/start")
    public ResponseEntity<?> startConversation(
            @PathVariable Long userId,
            @RequestHeader("X-User-Id") Long currentUserId) {
        try {
            ConversationResponse dto = conversationService.startOrGetConversation(currentUserId, userId);
            return ResponseEntity.ok(Map.of(
                    "success", true,
                    "message", "Conversation prête",
                    "data", dto
            ));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of(
                    "success", false,
                    "message", e.getMessage()
            ));
        }
    }

    // GET /api/social/conversations
    @GetMapping
    public ResponseEntity<?> getMyConversations(
            @RequestHeader("X-User-Id") Long userId) {
        List<ConversationResponse> list = conversationService.getMyConversations(userId);
        return ResponseEntity.ok(Map.of(
                "success", true,
                "data", list
        ));
    }
}