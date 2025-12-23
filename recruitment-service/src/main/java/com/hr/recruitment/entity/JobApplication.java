package com.hr.recruitment.entity;

import jakarta.persistence.*;
import lombok.Data;
import java.time.LocalDate;

@Entity
@Table(name = "job_applications")
@Data
public class JobApplication {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "job_position_id")
    private JobPosition jobPosition;

    private Long candidateId; // Eğer dış adaysa Candidate tablosundaki ID
    private Long employeeId;  // Eğer iç adaysa Employee tablosundaki ID

    @Enumerated(EnumType.STRING)
    private CandidateSource source; // INTERNAL / EXTERNAL

    // Görüntüleme amaçlı isimleri burada tutabiliriz (Snapshot)
    private String candidateName; 

    @Enumerated(EnumType.STRING)
    private ApplicationStatus status;

    private LocalDate applicationDate = LocalDate.now();
    private String notes;
}