package com.unilifehub.cours_formations_service.repository;

import com.unilifehub.cours_formations_service.entity.Comment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface CommentRepository extends JpaRepository<Comment, Integer> {
    List<Comment> findByResourceIdOrderByCreatedAtDesc(Integer resourceId);
    List<Comment> findByUserId(Integer userId);
    List<Comment> findByIsReportedTrue();
    long countByResourceId(Integer resourceId);
}