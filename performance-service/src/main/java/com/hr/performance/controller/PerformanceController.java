package com.hr.performance.controller;

import com.hr.performance.entity.*;
import com.hr.performance.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/performance")
@RequiredArgsConstructor
public class PerformanceController {

    private final SurveyTemplateRepository templateRepository;
    private final PerformanceReviewRepository reviewRepository;

    // --- ŞABLON İŞLEMLERİ ---

    @PostMapping("/templates")
    public SurveyTemplate createTemplate(@RequestBody SurveyTemplate template) {
        return templateRepository.save(template);
    }

    @GetMapping("/templates")
    public List<SurveyTemplate> getAllTemplates() {
        return templateRepository.findAll();
    }

    // EKSİK OLABİLECEK METOT 1: Tekil Şablon Getir
    @GetMapping("/templates/{id}")
    public SurveyTemplate getTemplateDetails(@PathVariable Long id) {
        return templateRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Şablon bulunamadı ID: " + id));
    }

    // --- DEĞERLENDİRME İŞLEMLERİ ---

    @PostMapping("/reviews")
    public PerformanceReview assignReview(@RequestBody PerformanceReview review) {
        review.setStatus("PENDING");
        SurveyTemplate template = templateRepository.findById(review.getTemplateId())
                .orElseThrow(() -> new RuntimeException("Şablon bulunamadı"));
        review.setTemplateTitle(template.getTitle());
        return reviewRepository.save(review);
    }

    @GetMapping("/reviews/reviewer/{reviewerId}")
    public List<PerformanceReview> getReviewsByReviewer(@PathVariable Long reviewerId) {
        return reviewRepository.findByReviewerId(reviewerId);
    }
    
    // EKSİK OLABİLECEK METOT 2: Tekil Değerlendirme Getir
    @GetMapping("/reviews/{id}")
    public PerformanceReview getReviewDetails(@PathVariable Long id) {
        return reviewRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Değerlendirme bulunamadı ID: " + id));
    }

    // --- ANKETİ DOLDURMA (KAYDETME) ---
    @PutMapping("/reviews/{id}")
    public PerformanceReview submitReview(@PathVariable Long id, @RequestBody List<ReviewResponse> responses) {
        PerformanceReview review = reviewRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Değerlendirme bulunamadı ID: " + id));
        
        review.setResponses(responses);
        review.setStatus("COMPLETED");
        return reviewRepository.save(review);
    }

    // YENİ: İK RAPORLAMA (FİLTRELİ ARAMA)
    @GetMapping("/reviews/search")
    public List<PerformanceReview> searchReviews(
            @RequestParam(name = "employeeId", required = false) Long employeeId,
            @RequestParam(name = "reviewerId", required = false) Long reviewerId,
            @RequestParam(name = "period", required = false) String period,
            @RequestParam(name = "status", required = false) String status,
            @RequestParam(name = "reviewType", required = false) String reviewType
    ) {
        // null kontrolü yaparak Specification'a gönderiyoruz
        return reviewRepository.findAll(PerformanceSpecs.withFilter(employeeId, reviewerId, period, status, reviewType));
    }
}