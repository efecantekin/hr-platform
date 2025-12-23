package com.hr.employee.dto;

import lombok.Data;

@Data
public class JobTitleRequest {
    private String title;
    private Long departmentId;
}