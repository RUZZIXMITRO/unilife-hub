package com.unilifehub.socialservice.controller;

import com.unilifehub.socialservice.dto.response.ApiResponse;
import com.unilifehub.socialservice.dto.response.FriendshipResponse;
import com.unilifehub.socialservice.service.FriendshipService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/social/friends")
@CrossOrigin(origins = "http://localhost:4200")
public class FriendshipController {

    @Autowired
    private FriendshipService friendshipService;

    // GET /api/social/friends → liste d'amis
    @GetMapping
    public ResponseEntity<ApiResponse<List<FriendshipResponse>>> getFriends(
            Authentication auth) {
        Long userId = (auth != null) ? (Long) auth.getPrincipal() : 0L;
        return ResponseEntity.ok(
                ApiResponse.success("Amis récupérés",
                        friendshipService.getFriends(userId)));
    }

    // GET /api/social/friends/requests → demandes reçues
    @GetMapping("/requests")
    public ResponseEntity<ApiResponse<List<FriendshipResponse>>> getPendingRequests(
            Authentication auth) {
        Long userId = (auth != null) ? (Long) auth.getPrincipal() : 0L;
        return ResponseEntity.ok(
                ApiResponse.success("Demandes récupérées",
                        friendshipService.getPendingRequests(userId)));
    }

    // POST /api/social/friends/request/{userId} → envoyer demande
    @PostMapping("/request/{addresseeId}")
    public ResponseEntity<ApiResponse<FriendshipResponse>> sendRequest(
            @PathVariable Long addresseeId,
            Authentication auth) {
        Long userId = (auth != null) ? (Long) auth.getPrincipal() : 0L;
        return ResponseEntity.ok(
                ApiResponse.success("Demande envoyée",
                        friendshipService.sendFriendRequest(userId, addresseeId)));
    }

    // PUT /api/social/friends/accept/{id} → accepter
    @PutMapping("/accept/{friendshipId}")
    public ResponseEntity<ApiResponse<FriendshipResponse>> acceptRequest(
            @PathVariable Long friendshipId,
            Authentication auth) {
        Long userId = (auth != null) ? (Long) auth.getPrincipal() : 0L;
        return ResponseEntity.ok(
                ApiResponse.success("Demande acceptée",
                        friendshipService.acceptRequest(friendshipId, userId)));
    }

    // DELETE /api/social/friends/reject/{id} → refuser
    @DeleteMapping("/reject/{friendshipId}")
    public ResponseEntity<ApiResponse<Void>> rejectRequest(
            @PathVariable Long friendshipId,
            Authentication auth) {
        Long userId = (auth != null) ? (Long) auth.getPrincipal() : 0L;
        friendshipService.rejectRequest(friendshipId, userId);
        return ResponseEntity.ok(
                ApiResponse.success("Demande refusée"));
    }

    // DELETE /api/social/friends/{userId} → supprimer ami
    @DeleteMapping("/{friendId}")
    public ResponseEntity<ApiResponse<Void>> removeFriend(
            @PathVariable Long friendId,
            Authentication auth) {
        Long userId = (auth != null) ? (Long) auth.getPrincipal() : 0L;
        friendshipService.removeFriend(userId, friendId);
        return ResponseEntity.ok(
                ApiResponse.success("Ami supprimé"));
    }
}