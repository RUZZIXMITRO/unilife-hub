package com.unilifehub.socialservice.repository;

import com.unilifehub.socialservice.entity.BlockList;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface BlockListRepository extends JpaRepository<BlockList, Long> {

    boolean existsByBlockerIdAndBlockedId(String blockerId, String blockedId);

    Optional<BlockList> findByBlockerIdAndBlockedId(String blockerId, String blockedId);

    List<BlockList> findByBlockerId(String blockerId);

    // ✅ AJOUT pour BUG #15 (Phase 2)
    List<BlockList> findByBlockedId(String blockedId);
}