package com.hr.document.entity;

import jakarta.persistence.*;
import lombok.Data;
import java.time.LocalDate;

@Entity
@Table(name = "document_requests")
@Data
public class DocumentRequest {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private Long employeeId; 
    
    @Column(nullable = false)
    private String documentType;

    private String description;
    
    private String status = "REQUESTED";

    private LocalDate requestedAt = LocalDate.now();
    
    private Long assignedHrId;
}