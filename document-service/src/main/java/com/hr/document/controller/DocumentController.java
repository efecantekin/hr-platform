package com.hr.document.controller;

import com.hr.document.entity.DocumentRequest;
import com.hr.document.service.DocumentService;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/documents")
public class DocumentController {
    private final DocumentService service;

    public DocumentController(DocumentService service) {
        this.service = service;
    }

    @PostMapping
    public DocumentRequest requestDocument(@RequestBody DocumentRequest request) {
        return service.createRequest(request);
    }

    @GetMapping("/employee/{employeeId}")
    public List<DocumentRequest> getMyRequests(@PathVariable Long employeeId) {
        return service.getMyDocuments(employeeId);
    }

    // Boştaki İşleri Listele (HR Havuzu)
    @GetMapping("/pool")
    public List<DocumentRequest> getDocumentPool() {
        return service.getUnassignedRequests();
    }

    // İşi Üzerine Al
    @PutMapping("/{id}/claim")
    public DocumentRequest claimTask(@PathVariable Long id, @RequestParam Long hrId) {
        return service.claimRequest(id, hrId);
    }

    // İşi Tamamla
    @PutMapping("/{id}/complete")
    public DocumentRequest completeTask(@PathVariable Long id) {
        return service.completeRequest(id);
    }
}