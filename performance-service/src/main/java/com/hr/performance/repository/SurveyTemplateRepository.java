package com.hr.performance.repository;

import com.hr.performance.entity.SurveyTemplate;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface SurveyTemplateRepository extends JpaRepository<SurveyTemplate, Long> {
    // Özel bir sorguya gerek yok, standart CRUD yeterli
}