package com.unilifehub.cours_formations_service.repository;

import com.unilifehub.cours_formations_service.entity.Favorite;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

@Repository
public interface FavoriteRepository extends JpaRepository<Favorite, Integer> {
    List<Favorite> findByUserId(Integer userId);
    Optional<Favorite> findByUserIdAndResourceId(Integer userId, Integer resourceId);
    boolean existsByUserIdAndResourceId(Integer userId, Integer resourceId);
    void deleteByUserIdAndResourceId(Integer userId, Integer resourceId);
}