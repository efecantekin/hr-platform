package com.hr.employee.dto;

import lombok.Data;

@Data
public class HierarchyAssignmentRequest {
    private Long subordinateId; 
    
    private Long managerId;
       
    private String managerPosition; 
}