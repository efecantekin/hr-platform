package com.hr.performance.repository;

import com.hr.performance.entity.PerformanceReview;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.util.StringUtils;

public class PerformanceSpecs {
    public static Specification<PerformanceReview> withFilter(
            Long employeeId, Long reviewerId, String period, String status, String reviewType) {
        return (root, query, cb) -> {
            Specification<PerformanceReview> spec = Specification.where(null);

            if (employeeId != null) 
                spec = spec.and((r, q, c) -> c.equal(r.get("employeeId"), employeeId));
            
            if (reviewerId != null) 
                spec = spec.and((r, q, c) -> c.equal(r.get("reviewerId"), reviewerId));
            
            if (StringUtils.hasText(period)) 
                spec = spec.and((r, q, c) -> c.equal(r.get("period"), period));
            
            if (StringUtils.hasText(status)) 
                spec = spec.and((r, q, c) -> c.equal(r.get("status"), status));

            if (StringUtils.hasText(reviewType)) 
                spec = spec.and((r, q, c) -> c.equal(r.get("reviewType"), reviewType));

            return spec.toPredicate(root, query, cb);
        };
    }
}