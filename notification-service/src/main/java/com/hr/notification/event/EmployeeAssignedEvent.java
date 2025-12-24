package com.hr.notification.event; // Diğer serviste com.hr.notification.event yapınız

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.io.Serializable;
import java.time.LocalDate;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class EmployeeAssignedEvent implements Serializable {
    private Long employeeId;
    private String employeeName;
    private String employeeEmail;
    
    private Long managerId;
    private String managerName;
    private String managerEmail;
    
    private LocalDate assignmentDate;
}