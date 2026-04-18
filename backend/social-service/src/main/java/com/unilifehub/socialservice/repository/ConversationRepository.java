package com.unilifehub.socialservice.repository;

import com.unilifehub.socialservice.entity.Conversation;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ConversationRepository extends JpaRepository<Conversation, Long> {

    // Trouver une conversation entre 2 users (dans les 2 sens)
    @Query("SELECT c FROM Conversation c WHERE " +
            "(c.user1Id = :u1 AND c.user2Id = :u2) OR " +
            "(c.user1Id = :u2 AND c.user2Id = :u1)")
    Optional<Conversation> findBetweenUsers(@Param("u1") Long u1, @Param("u2") Long u2);

    // Toutes les conversations d'un user
    @Query("SELECT c FROM Conversation c WHERE " +
            "c.user1Id = :userId OR c.user2Id = :userId " +
            "ORDER BY c.updatedAt DESC")
    List<Conversation> findAllByUserId(@Param("userId") Long userId);
}