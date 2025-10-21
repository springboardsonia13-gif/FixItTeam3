package com.fixitnow.dto;

import com.fixitnow.model.ChatMessage;

import java.time.LocalDateTime;

public class ChatMessageDTO {
    
    private Long id;
    private Long chatRoomId;
    private String roomId;
    private Long senderId;
    private String senderName;
    private String content;
    private ChatMessage.MessageType messageType;
    private LocalDateTime sentAt;
    private Boolean isRead;
    
    // Constructors
    public ChatMessageDTO() {}
    
    public ChatMessageDTO(Long id, Long chatRoomId, String roomId, Long senderId, 
                         String senderName, String content, ChatMessage.MessageType messageType, 
                         LocalDateTime sentAt, Boolean isRead) {
        this.id = id;
        this.chatRoomId = chatRoomId;
        this.roomId = roomId;
        this.senderId = senderId;
        this.senderName = senderName;
        this.content = content;
        this.messageType = messageType;
        this.sentAt = sentAt;
        this.isRead = isRead;
    }
    
    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    
    public Long getChatRoomId() { return chatRoomId; }
    public void setChatRoomId(Long chatRoomId) { this.chatRoomId = chatRoomId; }
    
    public String getRoomId() { return roomId; }
    public void setRoomId(String roomId) { this.roomId = roomId; }
    
    public Long getSenderId() { return senderId; }
    public void setSenderId(Long senderId) { this.senderId = senderId; }
    
    public String getSenderName() { return senderName; }
    public void setSenderName(String senderName) { this.senderName = senderName; }
    
    public String getContent() { return content; }
    public void setContent(String content) { this.content = content; }
    
    public ChatMessage.MessageType getMessageType() { return messageType; }
    public void setMessageType(ChatMessage.MessageType messageType) { this.messageType = messageType; }
    
    public LocalDateTime getSentAt() { return sentAt; }
    public void setSentAt(LocalDateTime sentAt) { this.sentAt = sentAt; }
    
    public Boolean getIsRead() { return isRead; }
    public void setIsRead(Boolean isRead) { this.isRead = isRead; }
}