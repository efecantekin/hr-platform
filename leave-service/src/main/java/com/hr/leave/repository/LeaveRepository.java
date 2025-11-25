package com.hr.leave.repository;

import com.hr.leave.entity.LeaveRequest;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface LeaveRepository extends JpaRepository<LeaveRequest, Long> {
    // Belirli bir çalışanın izinlerini bulmak için
    List<LeaveRequest> findByEmployeeId(Long employeeId);
    List<LeaveRequest> findByStatus(String status);
}