package com.hr.leave.event;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.io.Serializable;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class LeaveCreatedEvent implements Serializable {
    private Long managerId;
    private String employeeName;
    private String managerEmail;
    private String startDate;
    private String endDate;
}