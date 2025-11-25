package com.hr.document.repository;

import com.hr.document.entity.DocumentRequest;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface DocumentRepository extends JpaRepository<DocumentRequest, Long> {
    List<DocumentRequest> findByEmployeeId(Long employeeId);
}