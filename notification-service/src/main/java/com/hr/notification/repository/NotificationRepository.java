package com.hr.notification.repository;

import com.hr.notification.entity.Notification;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface NotificationRepository extends JpaRepository<Notification, Long> {
    // Kullanıcının tüm bildirimlerini tarihe göre tersten getir
    List<Notification> findByUserIdOrderByCreatedAtDesc(Long userId);
    
    // Sadece okunmamışları saymak için
    long countByUserIdAndIsReadFalse(Long userId);
}