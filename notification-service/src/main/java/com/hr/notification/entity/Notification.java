package com.hr.notification.entity;

import jakarta.persistence.*;
import lombok.Data;
import java.time.LocalDateTime;

@Entity
@Table(name = "notifications")
@Data
public class Notification {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private Long userId;        // Bildirimin kime gideceği
    private String title;       // Başlık (Örn: İzin Talebi)
    private String message;     // Mesaj (Örn: Ali Yılmaz izin istedi)
    private String targetUrl;   // Tıklanınca gideceği yer (Örn: /dashboard/leaves)
    
    private boolean isRead = false; // Okundu mu?
    
    private boolean sendEmail = false; // Email de atılsın mı?
    private String emailTo;            // Email adresi (Eğer sendEmail true ise)

    private LocalDateTime createdAt = LocalDateTime.now();
}