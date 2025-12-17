package com.hr.performance.entity;

import jakarta.persistence.*;
import lombok.Data;

@Entity
@Table(name = "review_responses")
@Data
public class ReviewResponse {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private Long questionId;
    private String questionText; // Soru metni değişirse tarihçe bozulmasın
    
    @Column(length = 2000)
    private String answerValue; // Cevap (Text, Puan veya Seçenek)
}