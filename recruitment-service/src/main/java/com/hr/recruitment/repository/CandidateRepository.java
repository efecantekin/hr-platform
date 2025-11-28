package com.hr.recruitment.repository;

import com.hr.recruitment.entity.Candidate;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor; // <--- BU EKLENDİ

// JpaSpecificationExecutor ekliyoruz
public interface CandidateRepository extends JpaRepository<Candidate, Long>, JpaSpecificationExecutor<Candidate> {
    // Eski @Query metodunu SİLİYORUZ. Artık ihtiyacımız yok.
}