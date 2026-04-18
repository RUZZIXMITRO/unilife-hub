package com.unilifehub.socialservice.repository;

import com.unilifehub.socialservice.entity.GroupPost;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface GroupPostRepository extends JpaRepository<GroupPost, Long> {

    List<GroupPost> findByGroupIdOrderByPostedAtDesc(Long groupId);

    List<GroupPost> findByPostedBy(Long postedBy);

    boolean existsByGroupIdAndPostId(Long groupId, Long postId);

    long countByGroupId(Long groupId);
}