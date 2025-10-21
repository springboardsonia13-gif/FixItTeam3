package com.fixitnow.dto;

import java.time.LocalDateTime;

public class ConversationDTO {
    
    private String id; // Will be "userId1-userId2" format
    private Long otherUserId;
    private String otherUserName;
    private String lastMessageText;
    private LocalDateTime lastMessageTime;
    private int unreadCount;
    private String lastMessageSender;
    
    // Constructors
    public ConversationDTO() {}
    
    public ConversationDTO(String id, Long otherUserId, String otherUserName, 
                          String lastMessageText, LocalDateTime lastMessageTime, 
                          int unreadCount, String lastMessageSender) {
        this.id = id;
        this.otherUserId = otherUserId;
        this.otherUserName = otherUserName;
        this.lastMessageText = lastMessageText;
        this.lastMessageTime = lastMessageTime;
        this.unreadCount = unreadCount;
        this.lastMessageSender = lastMessageSender;
    }
    
    // Getters and Setters
    public String getId() { return id; }
    public void setId(String id) { this.id = id; }
    
    public Long getOtherUserId() { return otherUserId; }
    public void setOtherUserId(Long otherUserId) { this.otherUserId = otherUserId; }
    
    public String getOtherUserName() { return otherUserName; }
    public void setOtherUserName(String otherUserName) { this.otherUserName = otherUserName; }
    
    public String getLastMessageText() { return lastMessageText; }
    public void setLastMessageText(String lastMessageText) { this.lastMessageText = lastMessageText; }
    
    public LocalDateTime getLastMessageTime() { return lastMessageTime; }
    public void setLastMessageTime(LocalDateTime lastMessageTime) { this.lastMessageTime = lastMessageTime; }
    
    public int getUnreadCount() { return unreadCount; }
    public void setUnreadCount(int unreadCount) { this.unreadCount = unreadCount; }
    
    public String getLastMessageSender() { return lastMessageSender; }
    public void setLastMessageSender(String lastMessageSender) { this.lastMessageSender = lastMessageSender; }
}