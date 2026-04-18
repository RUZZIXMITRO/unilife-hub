package com.unilifehub.socialservice.repository;

import com.unilifehub.socialservice.entity.BlockList;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface BlockListRepository extends JpaRepository<BlockList, Long> {

    boolean existsByBlockerIdAndBlockedId(Long blockerId, Long blockedId);

    Optional<BlockList> findByBlockerIdAndBlockedId(Long blockerId, Long blockedId);

    List<BlockList> findByBlockerId(Long blockerId);
}