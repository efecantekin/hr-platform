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

    public LeaveRequest createLeaveRequest(LeaveRequest request) {
        return repository.save(request);
    }

    public List<LeaveRequest> getLeavesByEmployee(Long employeeId) {
        return repository.findByEmployeeId(employeeId);
    }

    public List<LeaveRequest> getAllLeaves() {
        return repository.findAll();
    }

    public LeaveRequest updateLeaveStatus(Long leaveId, String newStatus) {
        LeaveRequest request = repository.findById(leaveId).orElseThrow();
        request.setStatus(newStatus);
        return repository.save(request);
    }

    public List<LeaveRequest> getLeavesByStatus(String status) {
        return repository.findByStatus(status);
    }
}