package com.hr.recruitment.entity;

import jakarta.persistence.*;
import lombok.Data;
import java.time.LocalDate;

@Entity
@Table(name = "candidates")
@Data
public class Candidate {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // Temel Bilgiler
    private String firstName;
    private String lastName;
    private String email;
    private String phone;

    // Filtreleme Kriterleri
    private String technologies; // Örn: "Java, React, Docker"
    private int experienceYears;
    private String previousCompanies;
    private String university;
    private String department;
    
    // Referans
    private String referenceType; // INTERNAL / EXTERNAL
    private String referenceName; // Referans olan kişi/kurum

    // Süreç Takibi
    // Aday Havuzu -> Telefon -> Teknik -> İK Mülakatı -> Teklif -> İşe Alındı -> Red
    private String status = "HAVUZ"; 
    
    private LocalDate applicationDate = LocalDate.now();
}