package com.unilifehub.socialservice.repository;

import com.unilifehub.socialservice.entity.Share;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ShareRepository extends JpaRepository<Share, Long> {

    List<Share> findByPostId(Long postId);

    List<Share> findByUserId(String userId);

    boolean existsByPostIdAndUserId(Long postId, String userId);

    long countByPostId(Long postId);
}