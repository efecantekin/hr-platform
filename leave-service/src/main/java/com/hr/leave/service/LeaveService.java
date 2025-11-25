package com.hr.leave.service;

import com.hr.leave.entity.LeaveRequest;
import com.hr.leave.repository.LeaveRepository;
import org.springframework.stereotype.Service;
import java.util.List;

@Service
public class LeaveService {

    private final LeaveRepository repository;

    public LeaveService(LeaveRepository repository) {
        this.repository = repository;
    }

    // İzin Talebi Oluştur
    public LeaveRequest createLeaveRequest(LeaveRequest request) {
        // İleride buraya "Kalan izni yetiyor mu?" kontrolü eklenecek
        return repository.save(request);
    }

    // Bir çalışanın izinlerini getir
    public List<LeaveRequest> getLeavesByEmployee(Long employeeId) {
        return repository.findByEmployeeId(employeeId);
    }

    // Tüm izinleri getir (Yönetici için)
    public List<LeaveRequest> getAllLeaves() {
        return repository.findAll();
    }

    // İzin Durumunu Güncelle (Onayla/Reddet)
    public LeaveRequest updateLeaveStatus(Long leaveId, String newStatus) {
        LeaveRequest request = repository.findById(leaveId).orElseThrow();
        request.setStatus(newStatus);
        return repository.save(request);
    }

    // Duruma göre getir
    public List<LeaveRequest> getLeavesByStatus(String status) {
        return repository.findByStatus(status);
    }
}