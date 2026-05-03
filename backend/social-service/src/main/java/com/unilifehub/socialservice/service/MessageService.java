package com.unilifehub.socialservice.service;

import com.unilifehub.socialservice.dto.request.SendMessageRequest;
import com.unilifehub.socialservice.dto.response.ConversationResponse;
import com.unilifehub.socialservice.dto.response.MessageResponse;
import com.unilifehub.socialservice.entity.Message;
import com.unilifehub.socialservice.entity.Notification;
import com.unilifehub.socialservice.repository.MessageRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class MessageService {

    @Autowired
    private MessageRepository messageRepository;

    @Autowired
    private ConversationService conversationService;  // ✅ AJOUT Phase 1.4

    @Autowired
    private NotificationService notificationService;  // ✅ AJOUT Phase 1.4

    @Autowired
    private BlockListService blockListService;  // ✅ AJOUT Phase 2

    // Envoyer un message
    @Transactional  // ✅ AJOUT Phase 1.4
    public MessageResponse sendMessage(String senderId, SendMessageRequest request) {
        String receiverId = request.getReceiverId();

        // ✅ AJOUT Phase 2 - BUG #15 : vérifier blocage
        if (blockListService.isBlocked(receiverId, senderId)
                || blockListService.isBlocked(senderId, receiverId)) {
            throw new RuntimeException("Conversation impossible : blocage actif");
        }

        // ✅ AJOUT Phase 1.4 - BUG #2 : garantir qu'une Conversation existe
        ConversationResponse conv = conversationService
                .startOrGetConversation(senderId, receiverId);

        // Sauvegarder le message
        Message message = Message.builder()
                .senderId(senderId)
                .receiverId(receiverId)
                .conversationId(conv.id())  // ✅ lier au conv
                .content(request.getContent())
                .isRead(false)
                .build();
        Message saved = messageRepository.save(message);

        // ✅ AJOUT Phase 1.4 : mettre à jour le lastMessage
        conversationService.updateLastMessage(conv.id(), request.getContent());

        // ✅ AJOUT Phase 1.4 : notifier le destinataire
        notificationService.createNotification(
                receiverId, senderId,
                Notification.NotificationType.MESSAGE,
                "Nouveau message", saved.getId()
        );

        return mapToResponse(saved);
    }

    // Récupérer la conversation avec un utilisateur
    public List<MessageResponse> getConversation(String userId, String otherUserId) {
        return messageRepository.findConversation(userId, otherUserId)
                .stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    // Marquer les messages comme lus
    public void markAsRead(Long messageId, String userId) {
        Message message = messageRepository.findById(messageId)
                .orElseThrow(() -> new RuntimeException("Message non trouvé"));

        if (!message.getReceiverId().equals(userId)) {
            throw new RuntimeException("Non autorisé");
        }

        message.setRead(true);
        messageRepository.save(message);
    }

    private MessageResponse mapToResponse(Message message) {
        return MessageResponse.builder()
                .id(message.getId())
                .senderId(message.getSenderId())
                .receiverId(message.getReceiverId())
                .conversationId(message.getConversationId())  // ✅ AJOUT
                .content(message.getContent())
                .isRead(message.isRead())
                .createdAt(message.getCreatedAt())
                .build();
    }
}