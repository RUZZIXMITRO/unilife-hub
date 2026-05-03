package com.unilifehub.socialservice.repository;

import com.unilifehub.socialservice.entity.Friendship;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

@Repository
public interface FriendshipRepository extends JpaRepository<Friendship, Long> {

    // Vérifier si une amitié existe entre deux utilisateurs
    Optional<Friendship> findByRequesterIdAndAddresseeId(
            String requesterId, String addresseeId);

    // Récupérer les demandes reçues en attente
    List<Friendship> findByAddresseeIdAndStatus(
            String addresseeId, Friendship.FriendshipStatus status);

    // Récupérer tous les amis acceptés
    @Query("SELECT f FROM Friendship f WHERE " +
            "(f.requesterId = :userId OR f.addresseeId = :userId) " +
            "AND f.status = 'ACCEPTED'")
    List<Friendship> findAllFriends(@Param("userId") String userId);

    // Vérifier si deux utilisateurs sont amis
    @Query("SELECT f FROM Friendship f WHERE " +
            "((f.requesterId = :userId1 AND f.addresseeId = :userId2) OR " +
            "(f.requesterId = :userId2 AND f.addresseeId = :userId1)) " +
            "AND f.status = 'ACCEPTED'")
    Optional<Friendship> findFriendship(
            @Param("userId1") String userId1,
            @Param("userId2") String userId2);
}