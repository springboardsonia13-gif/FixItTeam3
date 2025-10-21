package com.fixitnow.repository;

import com.fixitnow.model.ChatMessage;
import com.fixitnow.model.ChatRoom;
import com.fixitnow.model.User;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ChatMessageRepository extends JpaRepository<ChatMessage, Long> {
    
    List<ChatMessage> findByChatRoomOrderBySentAtAsc(ChatRoom chatRoom);
    
    Page<ChatMessage> findByChatRoomOrderBySentAtDesc(ChatRoom chatRoom, Pageable pageable);
    
    @Query("SELECT cm FROM ChatMessage cm WHERE cm.chatRoom = :chatRoom " +
           "ORDER BY cm.sentAt DESC LIMIT 1")
    ChatMessage findLastMessageByChatRoom(@Param("chatRoom") ChatRoom chatRoom);
    
    @Query("SELECT COUNT(cm) FROM ChatMessage cm WHERE cm.chatRoom = :chatRoom " +
           "AND cm.sender != :user AND cm.isRead = false")
    int countUnreadMessages(@Param("chatRoom") ChatRoom chatRoom, @Param("user") User user);
    
    @Modifying
    @Query("UPDATE ChatMessage cm SET cm.isRead = true WHERE cm.chatRoom = :chatRoom " +
           "AND cm.sender != :user AND cm.isRead = false")
    void markMessagesAsRead(@Param("chatRoom") ChatRoom chatRoom, @Param("user") User user);
    
    void deleteByChatRoom(ChatRoom chatRoom);
}