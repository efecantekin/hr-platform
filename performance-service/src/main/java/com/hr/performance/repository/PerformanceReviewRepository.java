package com.hr.performance.repository;

import com.hr.performance.entity.PerformanceReview;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface PerformanceReviewRepository extends JpaRepository<PerformanceReview, Long>, JpaSpecificationExecutor<PerformanceReview> {
    
    // Değerlendiren (Reviewer) olarak atandıklarım (Yöneticinin yapması gerekenler)
    List<PerformanceReview> findByReviewerId(Long reviewerId);

    // Değerlendirilen (Employee) olduğum kayıtlar (Çalışanın geçmiş değerlendirmeleri)
    List<PerformanceReview> findByEmployeeId(Long employeeId);
    
    // Belirli bir dönemdeki değerlendirmeler (Örn: "2024-Haziran")
    List<PerformanceReview> findByPeriod(String period);
}