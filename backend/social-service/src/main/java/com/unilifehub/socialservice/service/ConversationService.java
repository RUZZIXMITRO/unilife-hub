package com.unilifehub.socialservice.service;

import com.unilifehub.socialservice.dto.response.ConversationResponse;
import com.unilifehub.socialservice.entity.Conversation;
import com.unilifehub.socialservice.repository.ConversationRepository;
import com.unilifehub.socialservice.repository.MessageRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class ConversationService {

    @Autowired
    private ConversationRepository conversationRepository;

    @Autowired
    private MessageRepository messageRepository;

    // Démarrer ou récupérer une conversation existante
    @Transactional
    public ConversationResponse startOrGetConversation(String currentUserId, String otherUserId) {
        if (currentUserId.equals(otherUserId)) {
            throw new RuntimeException("Vous ne pouvez pas démarrer une conversation avec vous-même");
        }

        // Si la conversation existe déjà, la retourner
        return conversationRepository
                .findBetweenUsers(currentUserId, otherUserId)
                .map(this::mapToDto)
                .orElseGet(() -> {
                    // Sinon la créer
                    Conversation conv = new Conversation();
                    conv.setUser1Id(currentUserId);
                    conv.setUser2Id(otherUserId);
                    return mapToDto(conversationRepository.save(conv));
                });
    }

    // Récupérer toutes les conversations du user
    public List<ConversationResponse> getMyConversations(String userId) {
        return conversationRepository.findAllByUserId(userId)
                .stream()
                .map(this::mapToDto)
                .collect(Collectors.toList());
    }

    // Mettre à jour le dernier message (appelé depuis MessageService)
    public void updateLastMessage(Long conversationId, String content) {
        conversationRepository.findById(conversationId).ifPresent(conv -> {
            conv.setLastMessage(content);
            conv.setLastMessageAt(java.time.LocalDateTime.now());
            conversationRepository.save(conv);
        });
    }

    private ConversationResponse mapToDto(Conversation c) {
        return new ConversationResponse(
                c.getId(), c.getUser1Id(), c.getUser2Id(),
                c.getLastMessage(), c.getLastMessageAt(),
                c.getCreatedAt(), c.getUpdatedAt()
        );
    }
}