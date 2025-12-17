package com.hr.performance.entity;

import jakarta.persistence.*;
import lombok.Data;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "performance_reviews")
@Data
public class PerformanceReview {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private Long templateId;
    private String templateTitle;

    private Long employeeId;   // Değerlendirilen
    private Long reviewerId;   // Değerlendiren
    
    // YENİ: Değerlendirme Tipi (SELF, MANAGER, PEER, SUBORDINATE)
    private String reviewType; 

    // YENİ: Dönem Bilgisi (Örn: "2025-Haziran", "2025-Q2")
    private String period;

    private String status; // PENDING, COMPLETED
    private LocalDate dueDate;

    @OneToMany(cascade = CascadeType.ALL)
    @JoinColumn(name = "review_id")
    private List<ReviewResponse> responses = new ArrayList<>();
}