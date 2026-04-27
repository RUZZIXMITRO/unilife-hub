package com.unilifehub.socialservice.service;

import com.unilifehub.socialservice.dto.response.FriendshipResponse;
import com.unilifehub.socialservice.entity.Friendship;
import com.unilifehub.socialservice.entity.Notification;
import com.unilifehub.socialservice.repository.FriendshipRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class FriendshipService {

    @Autowired
    private FriendshipRepository friendshipRepository;

    @Autowired
    private NotificationService notificationService;

    // Envoyer une demande d'ami
    public FriendshipResponse sendFriendRequest(Long requesterId, Long addresseeId) {

        if (requesterId.equals(addresseeId)) {
            throw new RuntimeException("Vous ne pouvez pas vous ajouter vous-même");
        }

        // Vérifier si une demande existe déjà
        friendshipRepository.findFriendship(requesterId, addresseeId)
                .ifPresent(f -> {
                    throw new RuntimeException("Vous êtes déjà amis");
                });

        friendshipRepository.findByRequesterIdAndAddresseeId(requesterId, addresseeId)
                .ifPresent(f -> {
                    throw new RuntimeException("Demande déjà envoyée");
                });

        Friendship friendship = Friendship.builder()
                .requesterId(requesterId)
                .addresseeId(addresseeId)
                .status(Friendship.FriendshipStatus.PENDING)
                .build();

        Friendship saved = friendshipRepository.save(friendship);

        // Notifier le destinataire
        notificationService.createNotification(
                addresseeId,
                requesterId,
                Notification.NotificationType.FRIEND_REQUEST,
                "Vous avez reçu une demande d'ami",
                saved.getId()
        );

        return mapToResponse(saved);
    }

    // Accepter une demande
    public FriendshipResponse acceptRequest(Long friendshipId, Long userId) {
        Friendship friendship = friendshipRepository.findById(friendshipId)
                .orElseThrow(() -> new RuntimeException("Demande non trouvée"));

        if (!friendship.getAddresseeId().equals(userId)) {
            throw new RuntimeException("Non autorisé");
        }

        friendship.setStatus(Friendship.FriendshipStatus.ACCEPTED);
        Friendship saved = friendshipRepository.save(friendship);

        // Notifier l'envoyeur que sa demande a été acceptée
        notificationService.createNotification(
                friendship.getRequesterId(),
                userId,
                Notification.NotificationType.FRIEND_ACCEPTED,
                "Votre demande d'ami a été acceptée",
                friendshipId
        );

        return mapToResponse(saved);
    }

    // Refuser une demande
    public void rejectRequest(Long friendshipId, Long userId) {
        Friendship friendship = friendshipRepository.findById(friendshipId)
                .orElseThrow(() -> new RuntimeException("Demande non trouvée"));

        if (!friendship.getAddresseeId().equals(userId)) {
            throw new RuntimeException("Non autorisé");
        }

        friendshipRepository.delete(friendship);
    }

    // Supprimer un ami
    public void removeFriend(Long userId, Long friendId) {
        Friendship friendship = friendshipRepository
                .findFriendship(userId, friendId)
                .orElseThrow(() -> new RuntimeException("Amitié non trouvée"));

        friendshipRepository.delete(friendship);
    }

    // Récupérer la liste d'amis
    public List<FriendshipResponse> getFriends(Long userId) {
        return friendshipRepository.findAllFriends(userId)
                .stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    // Récupérer les demandes reçues
    public List<FriendshipResponse> getPendingRequests(Long userId) {
        return friendshipRepository
                .findByAddresseeIdAndStatus(userId, Friendship.FriendshipStatus.PENDING)
                .stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    private FriendshipResponse mapToResponse(Friendship friendship) {
        return FriendshipResponse.builder()
                .id(friendship.getId())
                .requesterId(friendship.getRequesterId())
                .addresseeId(friendship.getAddresseeId())
                .status(friendship.getStatus().name())
                .createdAt(friendship.getCreatedAt())
                .build();
    }
}