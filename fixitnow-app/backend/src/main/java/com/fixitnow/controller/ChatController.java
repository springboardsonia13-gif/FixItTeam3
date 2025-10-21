package com.fixitnow.controller;

import java.util.List;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.fixitnow.dto.ConversationDTO;
import com.fixitnow.dto.MessageDTO;
import com.fixitnow.service.ChatService;

@RestController
@RequestMapping("/api")
@CrossOrigin(origins = "*")
public class ChatController {

    @Autowired
    private ChatService chatService;

    // Get conversations for a user
    @GetMapping("/messages/conversations/{userId}")
    public ResponseEntity<List<ConversationDTO>> getConversations(@PathVariable Long userId) {
        try {
            List<ConversationDTO> conversations = chatService.getConversationsForUser(userId);
            return ResponseEntity.ok(conversations);
        } catch (Exception e) {
            // Log the error and return empty list for now
            System.err.println("Error getting conversations: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.ok(List.of()); // Return empty list instead of error
        }
    }

    // Get messages between two users (conversation)
    @GetMapping("/messages/conversation/{conversationId}")
    public ResponseEntity<List<MessageDTO>> getConversationMessages(@PathVariable String conversationId) {
        // Parse conversation ID (format: "userId1-userId2")
        String[] userIds = conversationId.split("-");
        if (userIds.length != 2) {
            return ResponseEntity.badRequest().build();
        }
        
        Long userId1 = Long.valueOf(userIds[0]);
        Long userId2 = Long.valueOf(userIds[1]);
        
        List<MessageDTO> messages = chatService.getMessagesBetweenUsers(userId1, userId2);
        return ResponseEntity.ok(messages);
    }

    // Send a message
    @PostMapping("/messages")
    public ResponseEntity<MessageDTO> sendMessage(@RequestBody Map<String, Object> request) {
        try {
            Long senderId = Long.valueOf(request.get("senderId").toString());
            Long receiverId = Long.valueOf(request.get("receiverId").toString());
            String content = request.get("text").toString();
            
            MessageDTO message = chatService.sendMessage(senderId, receiverId, content);
            return ResponseEntity.ok(message);
        } catch (Exception e) {
            System.err.println("Error sending message: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    // Mark messages as read
    @PostMapping("/messages/mark-read")
    public ResponseEntity<Void> markMessagesAsRead(@RequestBody Map<String, Long> request) {
        Long senderId = request.get("senderId");
        Long receiverId = request.get("receiverId");
        
        chatService.markMessagesAsRead(senderId, receiverId);
        return ResponseEntity.ok().build();
    }

    // Get unread message count
    @GetMapping("/messages/unread-count")
    public ResponseEntity<Map<String, Integer>> getUnreadCount(
            @RequestParam Long senderId, 
            @RequestParam Long receiverId) {
        
        int count = chatService.getUnreadMessageCount(senderId, receiverId);
        return ResponseEntity.ok(Map.of("unreadCount", count));
    }
}