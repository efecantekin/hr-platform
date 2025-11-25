package com.hr.document.service;

import com.hr.document.entity.DocumentRequest;
import com.hr.document.repository.DocumentRepository;
import org.springframework.stereotype.Service;
import java.util.List;

@Service
public class DocumentService {
    private final DocumentRepository repository;

    public DocumentService(DocumentRepository repository) {
        this.repository = repository;
    }

    public DocumentRequest createRequest(DocumentRequest request) {
        return repository.save(request);
    }

    public List<DocumentRequest> getMyDocuments(Long employeeId) {
        return repository.findByEmployeeId(employeeId);
    }

    // 1. Üzerine Alınmamış (Boştaki) Talepleri Getir
    public List<DocumentRequest> getUnassignedRequests() {
        // Statusu REQUESTED olanlar ve assignedHrId'si null olanlar
        // (Bunun için Repository'e findByStatusAndAssignedHrIdIsNull gibi bir metod yazılabilir
        // ama şimdilik tümünü çekip filtreleyelim veya basit tutalım)
        return repository.findAll().stream()
                .filter(doc -> doc.getAssignedHrId() == null)
                .toList();
    }

    // 2. İşi Üzerine Al (Claim)
    public DocumentRequest claimRequest(Long docId, Long hrId) {
        DocumentRequest doc = repository.findById(docId).orElseThrow();
        doc.setAssignedHrId(hrId);
        doc.setStatus("IN_PROGRESS"); // Durumu "İşleniyor" yap
        return repository.save(doc);
    }

    // 3. İşi Tamamla (Complete)
    public DocumentRequest completeRequest(Long docId) {
        DocumentRequest doc = repository.findById(docId).orElseThrow();
        doc.setStatus("DELIVERED"); // Durumu "Teslim Edildi" yap
        return repository.save(doc);
    }
}