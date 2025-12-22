package com.hr.notification.service;

import com.hr.notification.entity.Notification;
import com.hr.notification.repository.NotificationRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import java.util.List;

@Service
@RequiredArgsConstructor
public class NotificationService {

    private final NotificationRepository repository;
    private final EmailSenderService emailService;

    // Bildirim Oluştur (Ve gerekiyorsa Email at)
    public Notification createNotification(Notification notification) {
        Notification saved = repository.save(notification);

        if (notification.isSendEmail() && notification.getEmailTo() != null) {
            emailService.sendEmail(
                notification.getEmailTo(), 
                "HR Platform: " + notification.getTitle(), 
                notification.getMessage() + "\n\nDetaylar için sisteme giriş yapınız."
            );
        }
        return saved;
    }

    public List<Notification> getUserNotifications(Long userId) {
        return repository.findByUserIdOrderByCreatedAtDesc(userId);
    }
    
    public long getUnreadCount(Long userId) {
        return repository.countByUserIdAndIsReadFalse(userId);
    }

    public void markAsRead(Long id) {
        Notification n = repository.findById(id).orElseThrow();
        n.setRead(true);
        repository.save(n);
    }
}