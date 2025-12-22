package com.hr.leave.client;

import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import lombok.Data;
import java.util.List;

// Docker ortamında "employee-service", localde "localhost:8081"
@FeignClient(name = "employee-service", url = "${EMPLOYEE_URI:http://localhost:8081}")
public interface EmployeeClient {

    @GetMapping("/api/employees/{id}")
    EmployeeDto getEmployeeById(@PathVariable Long id);

    // YENİ EKLENEN: Yöneticinin ekibini getir
    @GetMapping("/api/employees/manager/{managerId}")
    List<EmployeeDto> getEmployeesByManager(@PathVariable Long managerId);


    // Basit bir DTO (Sadece ihtiyacımız olan alanlar)
    @Data
    class EmployeeDto {
        private Long id;
        private String firstName;
        private String lastName;
        private String email;
        private Long managerId; // Yöneticisini bulmak için lazım
    }
}