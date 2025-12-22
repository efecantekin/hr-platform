package com.hr.leave.dto;

import lombok.Data;
import lombok.Builder;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class NotificationRequest {
    private Long userId;        // Kime gidecek?
    private String title;       // Başlık
    private String message;     // İçerik
    private String targetUrl;   // Tıklayınca nereye gidecek?
    private boolean sendEmail;  // Mail atılsın mı?
    private String emailTo;     // Mail adresi
}