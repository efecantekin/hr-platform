package com.hr.performance.repository;

import com.hr.performance.entity.ReviewResponse;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface ReviewResponseRepository extends JpaRepository<ReviewResponse, Long> {
}