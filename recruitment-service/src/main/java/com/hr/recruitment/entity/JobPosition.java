package com.hr.recruitment.entity;

import jakarta.persistence.*;
import lombok.Data;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "job_positions")
@Data
public class JobPosition {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String title; // Pozisyon Adı (Java Developer vb.)
    private String customer; // Müşteri Adı
    private String requirements; // Aranan Özellikler (Kısa)
    
    @Column(length = 2000)
    private String description; // Detaylı Açıklama
    
    private Long assignedHrId; // Atanan İK Personeli
    private Long hiringManagerId; // İşe Alım Yöneticisi

    private String status = "OPEN"; // OPEN, CLOSED
    private LocalDate createdAt = LocalDate.now();

    // Bu pozisyona yapılan başvurular
    @OneToMany(mappedBy = "jobPosition", cascade = CascadeType.ALL)
    private List<JobApplication> applications = new ArrayList<>();
}