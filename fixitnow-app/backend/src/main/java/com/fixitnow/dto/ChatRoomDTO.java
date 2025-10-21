package com.fixitnow.dto;

import java.time.LocalDateTime;
import java.util.List;

public class ChatRoomDTO {
    
    private Long id;
    private String roomId;
    private Long customerId;
    private String customerName;
    private Long providerId;
    private String providerName;
    private Long bookingId;
    private String serviceTitle;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private Boolean isActive;
    private ChatMessageDTO lastMessage;
    private List<ChatMessageDTO> messages;
    private int unreadCount;
    
    // Constructors
    public ChatRoomDTO() {}
    
    public ChatRoomDTO(Long id, String roomId, Long customerId, String customerName,
                      Long providerId, String providerName, Long bookingId, 
                      String serviceTitle, LocalDateTime createdAt, LocalDateTime updatedAt,
                      Boolean isActive) {
        this.id = id;
        this.roomId = roomId;
        this.customerId = customerId;
        this.customerName = customerName;
        this.providerId = providerId;
        this.providerName = providerName;
        this.bookingId = bookingId;
        this.serviceTitle = serviceTitle;
        this.createdAt = createdAt;
        this.updatedAt = updatedAt;
        this.isActive = isActive;
    }
    
    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    
    public String getRoomId() { return roomId; }
    public void setRoomId(String roomId) { this.roomId = roomId; }
    
    public Long getCustomerId() { return customerId; }
    public void setCustomerId(Long customerId) { this.customerId = customerId; }
    
    public String getCustomerName() { return customerName; }
    public void setCustomerName(String customerName) { this.customerName = customerName; }
    
    public Long getProviderId() { return providerId; }
    public void setProviderId(Long providerId) { this.providerId = providerId; }
    
    public String getProviderName() { return providerName; }
    public void setProviderName(String providerName) { this.providerName = providerName; }
    
    public Long getBookingId() { return bookingId; }
    public void setBookingId(Long bookingId) { this.bookingId = bookingId; }
    
    public String getServiceTitle() { return serviceTitle; }
    public void setServiceTitle(String serviceTitle) { this.serviceTitle = serviceTitle; }
    
    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
    
    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }
    
    public Boolean getIsActive() { return isActive; }
    public void setIsActive(Boolean isActive) { this.isActive = isActive; }
    
    public ChatMessageDTO getLastMessage() { return lastMessage; }
    public void setLastMessage(ChatMessageDTO lastMessage) { this.lastMessage = lastMessage; }
    
    public List<ChatMessageDTO> getMessages() { return messages; }
    public void setMessages(List<ChatMessageDTO> messages) { this.messages = messages; }
    
    public int getUnreadCount() { return unreadCount; }
    public void setUnreadCount(int unreadCount) { this.unreadCount = unreadCount; }
}