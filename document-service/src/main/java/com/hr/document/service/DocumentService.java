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

    public List<DocumentRequest> getUnassignedRequests() {
        return repository.findAll().stream()
                .filter(doc -> doc.getAssignedHrId() == null)
                .toList();
    }

    public DocumentRequest claimRequest(Long docId, Long hrId) {
        DocumentRequest doc = repository.findById(docId).orElseThrow();
        doc.setAssignedHrId(hrId);
        doc.setStatus("IN_PROGRESS"); 
        return repository.save(doc);
    }
    
    public DocumentRequest completeRequest(Long docId) {
        DocumentRequest doc = repository.findById(docId).orElseThrow();
        doc.setStatus("DELIVERED"); 
        return repository.save(doc);
    }
}