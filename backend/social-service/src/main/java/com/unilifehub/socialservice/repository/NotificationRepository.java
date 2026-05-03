package com.unilifehub.socialservice.repository;

import com.unilifehub.socialservice.entity.Notification;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface NotificationRepository extends JpaRepository<Notification, Long> {

    // Récupérer les notifications d'un utilisateur
    List<Notification> findByUserIdOrderByCreatedAtDesc(String userId);

    // Compter les non lues
    int countByUserIdAndIsRead(String userId, boolean isRead);
}