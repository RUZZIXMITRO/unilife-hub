package com.unilifehub.socialservice.service;

import com.unilifehub.socialservice.dto.response.BlockListResponse;
import com.unilifehub.socialservice.entity.BlockList;
import com.unilifehub.socialservice.repository.BlockListRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

@Service
public class BlockListService {

    @Autowired
    private BlockListRepository blockListRepository;

    // Bloquer un utilisateur
    public BlockListResponse blockUser(String blockerId, String blockedId) {
        if (blockerId.equals(blockedId)) {
            throw new RuntimeException("Vous ne pouvez pas vous bloquer vous-même");
        }
        if (blockListRepository.existsByBlockerIdAndBlockedId(blockerId, blockedId)) {
            throw new RuntimeException("Cet utilisateur est déjà bloqué");
        }

        BlockList block = new BlockList();
        block.setBlockerId(blockerId);
        block.setBlockedId(blockedId);

        BlockList saved = blockListRepository.save(block);
        return mapToDto(saved);
    }

    // Débloquer un utilisateur
    public void unblockUser(String blockerId, String blockedId) {
        BlockList block = blockListRepository
                .findByBlockerIdAndBlockedId(blockerId, blockedId)
                .orElseThrow(() -> new RuntimeException("Blocage introuvable"));

        blockListRepository.delete(block);
    }

    // Liste des utilisateurs bloqués par userId
    public List<BlockListResponse> getBlockedUsers(String blockerId) {
        return blockListRepository.findByBlockerId(blockerId)
                .stream()
                .map(this::mapToDto)
                .collect(Collectors.toList());
    }

    // Vérifier si un user est bloqué
    public boolean isBlocked(String blockerId, String blockedId) {
        return blockListRepository.existsByBlockerIdAndBlockedId(blockerId, blockedId);
    }

    // ✅ AJOUT pour Phase 2 - BUG #15
    /**
     * Retourne tous les userIds avec qui l'utilisateur a une relation de blocage
     * (qu'il bloque OU qui le bloquent).
     */
    public Set<String> getMutuallyBlockedIds(String userId) {
        Set<String> blocked = blockListRepository.findByBlockerId(userId).stream()
                .map(BlockList::getBlockedId)
                .collect(Collectors.toSet());
        Set<String> blockedBy = blockListRepository.findByBlockedId(userId).stream()
                .map(BlockList::getBlockerId)
                .collect(Collectors.toSet());
        blocked.addAll(blockedBy);
        return blocked;
    }

    private BlockListResponse mapToDto(BlockList block) {
        return new BlockListResponse(
                block.getId(),
                block.getBlockerId(),
                block.getBlockedId(),
                block.getBlockedAt()
        );
    }
}