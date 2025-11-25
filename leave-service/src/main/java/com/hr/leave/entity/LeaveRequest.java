package com.hr.leave.entity;

import jakarta.persistence.*;
import lombok.Data;
import java.time.LocalDate;

@Entity
@Table(name = "leave_requests")
@Data
public class LeaveRequest {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // İzni isteyen personelin ID'si (Employee Service'deki ID)
    @Column(nullable = false)
    private Long employeeId;

    // İzin Türü (Yıllık, Mazeret, Hastalık vs.)
    private String leaveType;

    @Column(nullable = false)
    private LocalDate startDate;

    @Column(nullable = false)
    private LocalDate endDate;

    // Açıklama / Not
    private String description;

    // Durum: PENDING (Bekliyor), APPROVED (Onaylandı), REJECTED (Reddedildi)
    private String status = "PENDING";

    // Talep oluşturulma tarihi
    private LocalDate requestedAt = LocalDate.now();
}