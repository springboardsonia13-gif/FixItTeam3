package com.fixitnow.repository;

import com.fixitnow.model.ChatRoom;
import com.fixitnow.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ChatRoomRepository extends JpaRepository<ChatRoom, Long> {
    
    Optional<ChatRoom> findByRoomId(String roomId);
    
    @Query("SELECT cr FROM ChatRoom cr WHERE " +
           "(cr.customer = :user OR cr.provider = :user) AND cr.isActive = true " +
           "ORDER BY cr.updatedAt DESC")
    List<ChatRoom> findByUserOrderByUpdatedAtDesc(@Param("user") User user);
    
    @Query("SELECT cr FROM ChatRoom cr WHERE " +
           "((cr.customer = :customer AND cr.provider = :provider) OR " +
           "(cr.customer = :provider AND cr.provider = :customer)) AND " +
           "cr.isActive = true")
    Optional<ChatRoom> findByCustomerAndProvider(@Param("customer") User customer, 
                                               @Param("provider") User provider);
    
    @Query("SELECT cr FROM ChatRoom cr WHERE cr.booking.id = :bookingId AND cr.isActive = true")
    Optional<ChatRoom> findByBookingId(@Param("bookingId") Long bookingId);
    
    boolean existsByCustomerAndProviderAndIsActiveTrue(User customer, User provider);
}