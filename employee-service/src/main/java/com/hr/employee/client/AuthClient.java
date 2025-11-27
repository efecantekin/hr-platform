package com.hr.employee.client;

import com.hr.employee.dto.RegisterRequest;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;

@FeignClient(name = "auth-service", url = "${AUTH_SERVICE_URL:http://localhost:8082}")
public interface AuthClient {

    @PostMapping("/auth/register")
    String registerUser(@RequestBody RegisterRequest request);
}