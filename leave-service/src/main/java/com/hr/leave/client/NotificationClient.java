package com.hr.leave.client;

import com.hr.leave.dto.NotificationRequest;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;

// Docker ortamında "notification-service" ismini, localde "localhost:8088"i kullanır
@FeignClient(name = "notification-service", url = "${NOTIFICATION_URI:http://localhost:8088}")
public interface NotificationClient {

    @PostMapping("/api/notifications")
    void sendNotification(@RequestBody NotificationRequest request);
}