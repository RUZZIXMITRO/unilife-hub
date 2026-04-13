package com.unilifehub.socialservice.service;

import com.unilifehub.socialservice.dto.request.SendMessageRequest;
import com.unilifehub.socialservice.dto.response.MessageResponse;
import com.unilifehub.socialservice.entity.Message;
import com.unilifehub.socialservice.repository.MessageRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class MessageService {

    @Autowired
    private MessageRepository messageRepository;

    // Envoyer un message
    public MessageResponse sendMessage(Long senderId, SendMessageRequest request) {
        Message message = Message.builder()
                .senderId(senderId)
                .receiverId(request.getReceiverId())
                .content(request.getContent())
                .isRead(false)
                .build();

        return mapToResponse(messageRepository.save(message));
    }

    // Récupérer la conversation avec un utilisateur
    public List<MessageResponse> getConversation(Long userId, Long otherUserId) {
        return messageRepository.findConversation(userId, otherUserId)
                .stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    // Marquer les messages comme lus
    public void markAsRead(Long messageId, Long userId) {
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
                .content(message.getContent())
                .isRead(message.isRead())
                .createdAt(message.getCreatedAt())
                .build();
    }
}