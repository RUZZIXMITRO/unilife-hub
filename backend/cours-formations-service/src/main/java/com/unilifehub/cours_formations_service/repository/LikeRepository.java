package com.unilifehub.cours_formations_service.repository;

import com.unilifehub.cours_formations_service.entity.Like;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface LikeRepository extends JpaRepository<Like, Integer> {
    boolean existsByUserIdAndResourceId(Integer userId, Integer resourceId);
    void deleteByUserIdAndResourceId(Integer userId, Integer resourceId);
    long countByResourceId(Integer resourceId);
}