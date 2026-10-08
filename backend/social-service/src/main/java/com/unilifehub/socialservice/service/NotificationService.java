package com.unilifehub.socialservice.service;

import com.unilifehub.socialservice.dto.response.NotificationResponse;
import com.unilifehub.socialservice.entity.Notification;
import com.unilifehub.socialservice.repository.NotificationRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class NotificationService {

    @Autowired
    private NotificationRepository notificationRepository;

    // Récupérer les notifications d'un utilisateur
    public List<NotificationResponse> getNotifications(String userId) {
        return notificationRepository
                .findByUserIdOrderByCreatedAtDesc(userId)
                .stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    // Marquer une notification comme lue
    public void markAsRead(Long notificationId, String userId) {
        Notification notification = notificationRepository
                .findById(notificationId)
                .orElseThrow(() -> new RuntimeException("Notification non trouvée"));

        if (!notification.getUserId().equals(userId)) {
            throw new RuntimeException("Non autorisé");
        }

        notification.setRead(true);
        notificationRepository.save(notification);
    }

    // Marquer toutes les notifications comme lues
    @Transactional  // ✅ AJOUT Phase 3
    public void markAllAsRead(String userId) {
        List<Notification> notifications = notificationRepository
                .findByUserIdOrderByCreatedAtDesc(userId);

        notifications.forEach(n -> n.setRead(true));
        notificationRepository.saveAll(notifications);
    }

    // Compter les non lues
    public int countUnread(String userId) {
        return notificationRepository.countByUserIdAndIsRead(userId, false);
    }

    // Créer une notification (appelé par les autres services)
    public void createNotification(String userId, String relatedUserId,
                                   Notification.NotificationType type,
                                   String message, Long referenceId) {
        Notification notification = Notification.builder()
                .userId(userId)
                .relatedUserId(relatedUserId)
                .type(type)
                .message(message)
                .referenceId(referenceId)
                .build();

        notificationRepository.save(notification);
    }

    private NotificationResponse mapToResponse(Notification notification) {
        return NotificationResponse.builder()
                .id(notification.getId())
                .userId(notification.getUserId())
                .relatedUserId(notification.getRelatedUserId())
                .type(notification.getType().name())
                .message(notification.getMessage())
                .referenceId(notification.getReferenceId())
                .isRead(notification.isRead())
                .createdAt(notification.getCreatedAt())
                .build();
    }
}