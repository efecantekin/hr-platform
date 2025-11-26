package com.hr.employee.dto;

import lombok.Data;

@Data
public class HierarchyAssignmentRequest {
    // Kime atama yapılıyor? (Ast)
    private Long subordinateId; 
    
    // Kim yönetici oluyor?
    private Long managerId;
    
    // Yöneticinin yeni/güncel pozisyon bilgisi (Frontend'den gelecek)
    private String managerPosition; 
}