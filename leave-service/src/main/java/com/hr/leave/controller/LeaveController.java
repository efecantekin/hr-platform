package com.hr.leave.controller;

import com.hr.leave.entity.LeaveRequest;
import com.hr.leave.service.LeaveService;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/leaves")
public class LeaveController {

    private final LeaveService service;

    public LeaveController(LeaveService service) {
        this.service = service;
    }

    // Talep Oluştur
    @PostMapping
    public LeaveRequest createRequest(@RequestBody LeaveRequest request) {
        return service.createLeaveRequest(request);
    }

    // Çalışanın İzinlerini Getir
    @GetMapping("/employee/{employeeId}")
    public List<LeaveRequest> getMyLeaves(@PathVariable Long employeeId) {
        return service.getLeavesByEmployee(employeeId);
    }

    // Onay Bekleyenleri Getir (PENDING olanlar)
    @GetMapping("/pending")
    public List<LeaveRequest> getPendingLeaves() {
        return service.getLeavesByStatus("PENDING");
    }

    // İzni Onayla veya Redd et
    @PutMapping("/{id}/status")
    public LeaveRequest updateStatus(@PathVariable Long id, @RequestParam String status) {
        return service.updateLeaveStatus(id, status);
    }
}