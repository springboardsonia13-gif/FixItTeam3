package com.fixitnow.controller;

import com.fixitnow.service.ChatService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.messaging.handler.annotation.DestinationVariable;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.messaging.simp.SimpMessageHeaderAccessor;
import org.springframework.stereotype.Controller;

import java.security.Principal;
import java.util.Map;

@Controller
public class WebSocketChatController {

    @Autowired
    private ChatService chatService;

    @MessageMapping("/chat.sendMessage/{conversationId}")
    public void sendMessage(@DestinationVariable String conversationId, 
                          @Payload Map<String, Object> chatMessage,
                          SimpMessageHeaderAccessor headerAccessor,
                          Principal principal) {
        try {
            Long senderId = Long.valueOf(chatMessage.get("senderId").toString());
            Long receiverId = Long.valueOf(chatMessage.get("receiverId").toString());
            String content = chatMessage.get("content").toString();
            
            // Send the message through the chat service
            chatService.sendMessage(senderId, receiverId, content);
            
        } catch (NumberFormatException e) {
            System.err.println("Error parsing user IDs: " + e.getMessage());
        } catch (Exception e) {
            System.err.println("Error sending message: " + e.getMessage());
        }
    }

    @MessageMapping("/chat.addUser/{conversationId}")
    public void addUser(@DestinationVariable String conversationId,
                       @Payload Map<String, Object> chatMessage,
                       SimpMessageHeaderAccessor headerAccessor) {
        try {
            String username = chatMessage.get("sender").toString();
            
            // Add username in web socket session
            var sessionAttributes = headerAccessor.getSessionAttributes();
            if (sessionAttributes != null) {
                sessionAttributes.put("username", username);
                sessionAttributes.put("conversationId", conversationId);
            }
            
        } catch (Exception e) {
            System.err.println("Error adding user to chat: " + e.getMessage());
        }
    }

    @MessageMapping("/chat.markAsRead/{conversationId}")
    public void markAsRead(@DestinationVariable String conversationId,
                          @Payload Map<String, Object> request,
                          Principal principal) {
        try {
            // Parse conversation ID to get the two user IDs
            String[] userIds = conversationId.split("-");
            if (userIds.length == 2) {
                Long userId = Long.valueOf(request.get("userId").toString());
                Long otherUserId = userId.equals(Long.valueOf(userIds[0])) ? 
                                 Long.valueOf(userIds[1]) : Long.valueOf(userIds[0]);
                
                chatService.markMessagesAsRead(otherUserId, userId);
            }
        } catch (NumberFormatException e) {
            System.err.println("Error parsing conversation ID or user ID: " + e.getMessage());
        } catch (Exception e) {
            System.err.println("Error marking messages as read: " + e.getMessage());
        }
    }
}