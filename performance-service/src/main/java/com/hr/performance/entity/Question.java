package com.hr.performance.entity;

import jakarta.persistence.*;
import lombok.Data;

@Entity
@Table(name = "questions")
@Data
public class Question {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String text; // Soru metni

    @Enumerated(EnumType.STRING)
    private QuestionType type;

    private int orderIndex; // Sıralama için

    // Çoktan seçmeli ise seçenekler (Virgülle ayrılmış tutabiliriz basitlik için)
    private String options; 
}