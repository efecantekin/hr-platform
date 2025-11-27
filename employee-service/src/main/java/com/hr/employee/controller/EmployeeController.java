package com.hr.employee.controller;

import com.hr.employee.dto.HierarchyAssignmentRequest;
import com.hr.employee.entity.Employee;
import com.hr.employee.service.EmployeeService;

import lombok.RequiredArgsConstructor;

import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/employees")
@RequiredArgsConstructor
public class EmployeeController {

    private final EmployeeService employeeService;

    @GetMapping
    public List<Employee> getAllEmployees() {        
        return employeeService.getAllEmployees();
    }

    @PostMapping
    public Employee createEmployee(@RequestBody Employee employee) {        
        return employeeService.createEmployee(employee);
    }

    @GetMapping("/manager/{managerId}")
    public List<Employee> getMyTeam(@PathVariable Long managerId) {        
        return employeeService.getTeamMembers(managerId);
    }

    @PostMapping("/assign-hierarchy")
    public Employee assignHierarchy(@RequestBody HierarchyAssignmentRequest request) {
        return employeeService.assignHierarchy(request);
    }
        
    @GetMapping("/roots")
    public List<Employee> getRootEmployees() {
        return employeeService.getRootEmployees();
    }
    
    @GetMapping("/{id}")
    public Employee getEmployeeById(@PathVariable Long id) {
        return employeeService.getEmployeeById(id);
    }
}