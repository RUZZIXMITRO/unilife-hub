package com.unilifehub.cours_formations_service.repository;

import com.unilifehub.cours_formations_service.entity.Favorite;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

@Repository
public interface FavoriteRepository extends JpaRepository<Favorite, Integer> {
    List<Favorite> findByUserId(String userId);
    Optional<Favorite> findByUserIdAndResourceId(String userId, Integer resourceId);
    boolean existsByUserIdAndResourceId(String userId, Integer resourceId);
    void deleteByUserIdAndResourceId(String userId, Integer resourceId);
}