package com.fixitnow.service;

import com.fixitnow.dto.ConversationDTO;
import com.fixitnow.dto.MessageDTO;
import com.fixitnow.model.Message;
import com.fixitnow.model.User;
import com.fixitnow.repository.MessageRepository;
import com.fixitnow.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@Transactional
public class ChatService {

    @Autowired
    private MessageRepository messageRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private SimpMessagingTemplate messagingTemplate;

    // Get conversations for a user  
    public List<ConversationDTO> getConversationsForUser(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));
        
        List<Message> conversations = messageRepository.findConversationsForUser(user);
        
        return conversations.stream()
                .map(msg -> convertToConversationDTO(msg, user))
                .collect(Collectors.toList());
    }

    // Get messages between two users
    public List<MessageDTO> getMessagesBetweenUsers(Long userId1, Long userId2) {
        User user1 = userRepository.findById(userId1)
                .orElseThrow(() -> new RuntimeException("User not found"));
        User user2 = userRepository.findById(userId2)
                .orElseThrow(() -> new RuntimeException("User not found"));
        
        List<Message> messages = messageRepository.findMessagesBetweenUsers(user1, user2);
        
        return messages.stream()
                .map(this::convertToMessageDTO)
                .collect(Collectors.toList());
    }

    // Send a message
    public MessageDTO sendMessage(Long senderId, Long receiverId, String content) {
        User sender = userRepository.findById(senderId)
                .orElseThrow(() -> new RuntimeException("Sender not found"));
        User receiver = userRepository.findById(receiverId)
                .orElseThrow(() -> new RuntimeException("Receiver not found"));
        
        // Create and save the message
        Message message = new Message(sender, receiver, content);
        message = messageRepository.save(message);
        
        // Convert to DTO
        MessageDTO messageDTO = convertToMessageDTO(message);
        
        // Send real-time message via WebSocket
        String conversationId = getConversationId(senderId, receiverId);
        messagingTemplate.convertAndSend("/topic/conversation/" + conversationId, messageDTO);
        
        // Send notification to the receiver
        messagingTemplate.convertAndSendToUser(receiverId.toString(), "/queue/notifications", messageDTO);
        
        return messageDTO;
    }

    // Mark messages as read
    public void markMessagesAsRead(Long senderId, Long receiverId) {
        User sender = userRepository.findById(senderId)
                .orElseThrow(() -> new RuntimeException("Sender not found"));
        User receiver = userRepository.findById(receiverId)
                .orElseThrow(() -> new RuntimeException("Receiver not found"));
        
        messageRepository.markMessagesAsRead(sender, receiver);
    }

    // Get unread message count
    public int getUnreadMessageCount(Long senderId, Long receiverId) {
        User sender = userRepository.findById(senderId)
                .orElseThrow(() -> new RuntimeException("Sender not found"));
        User receiver = userRepository.findById(receiverId)
                .orElseThrow(() -> new RuntimeException("Receiver not found"));
        
        return messageRepository.countUnreadMessages(sender, receiver);
    }

    // Helper methods
    private String getConversationId(Long userId1, Long userId2) {
        // Create consistent conversation ID regardless of order
        long smaller = Math.min(userId1, userId2);
        long larger = Math.max(userId1, userId2);
        return smaller + "-" + larger;
    }

    private ConversationDTO convertToConversationDTO(Message message, User currentUser) {
        User otherUser = message.getSender().getId().equals(currentUser.getId()) 
                        ? message.getReceiver() 
                        : message.getSender();
        
        String conversationId = getConversationId(currentUser.getId(), otherUser.getId());
        int unreadCount = messageRepository.countUnreadMessages(otherUser, currentUser);
        
        return new ConversationDTO(
            conversationId,
            otherUser.getId(),
            otherUser.getName(),
            message.getContent(),
            message.getSentAt(),
            unreadCount,
            message.getSender().getName()
        );
    }

    private MessageDTO convertToMessageDTO(Message message) {
        return new MessageDTO(
            message.getId(),
            message.getSender().getId(),
            message.getSender().getName(),
            message.getReceiver().getId(),
            message.getReceiver().getName(),
            message.getContent(),
            message.getSentAt(),
            message.getIsRead()
        );
    }
}