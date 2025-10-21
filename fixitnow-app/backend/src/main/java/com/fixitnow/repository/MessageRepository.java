package com.fixitnow.repository;

import com.fixitnow.model.Message;
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
public interface MessageRepository extends JpaRepository<Message, Long> {
    
    // Get conversations (unique sender-receiver pairs) for a user
    @Query("SELECT DISTINCT m FROM Message m WHERE " +
           "(m.sender = :user OR m.receiver = :user) " +
           "AND m.id IN (" +
           "    SELECT MAX(m2.id) FROM Message m2 WHERE " +
           "    ((m2.sender = m.sender AND m2.receiver = m.receiver) OR " +
           "     (m2.sender = m.receiver AND m2.receiver = m.sender))" +
           "    GROUP BY " +
           "    CASE WHEN m2.sender.id < m2.receiver.id " +
           "         THEN CONCAT(m2.sender.id, '-', m2.receiver.id) " +
           "         ELSE CONCAT(m2.receiver.id, '-', m2.sender.id) END" +
           ") ORDER BY m.sentAt DESC")
    List<Message> findConversationsForUser(@Param("user") User user);
    
    // Get messages between two users
    @Query("SELECT m FROM Message m WHERE " +
           "((m.sender = :user1 AND m.receiver = :user2) OR " +
           " (m.sender = :user2 AND m.receiver = :user1)) " +
           "ORDER BY m.sentAt ASC")
    List<Message> findMessagesBetweenUsers(@Param("user1") User user1, @Param("user2") User user2);
    
    // Get messages between two users with pagination
    @Query("SELECT m FROM Message m WHERE " +
           "((m.sender = :user1 AND m.receiver = :user2) OR " +
           " (m.sender = :user2 AND m.receiver = :user1)) " +
           "ORDER BY m.sentAt DESC")
    Page<Message> findMessagesBetweenUsers(@Param("user1") User user1, @Param("user2") User user2, Pageable pageable);
    
    // Count unread messages from a specific sender to receiver
    @Query("SELECT COUNT(m) FROM Message m WHERE " +
           "m.sender = :sender AND m.receiver = :receiver AND m.isRead = false")
    int countUnreadMessages(@Param("sender") User sender, @Param("receiver") User receiver);
    
    // Mark messages as read
    @Modifying
    @Query("UPDATE Message m SET m.isRead = true WHERE " +
           "m.sender = :sender AND m.receiver = :receiver AND m.isRead = false")
    void markMessagesAsRead(@Param("sender") User sender, @Param("receiver") User receiver);
}