package com.unilifehub.socialservice.repository;

import com.unilifehub.socialservice.entity.Message;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface MessageRepository extends JpaRepository<Message, Long> {

    // Récupérer la conversation entre deux utilisateurs
    @Query("SELECT m FROM Message m WHERE " +
            "(m.senderId = :userId1 AND m.receiverId = :userId2) OR " +
            "(m.senderId = :userId2 AND m.receiverId = :userId1) " +
            "ORDER BY m.createdAt ASC")
    List<Message> findConversation(
            @Param("userId1") String userId1,
            @Param("userId2") String userId2);

    // Compter les messages non lus
    int countBySenderIdAndReceiverIdAndIsRead(
            String senderId, String receiverId, boolean isRead);
}