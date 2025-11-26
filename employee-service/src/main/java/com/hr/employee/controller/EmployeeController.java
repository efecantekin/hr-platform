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

    // 1. Tüm Çalışanları Getir
    @GetMapping
    public List<Employee> getAllEmployees() {
        // Repository yerine Service kullanıyoruz
        return employeeService.getAllEmployees();
    }

    // 2. Yeni Çalışan Ekle
    @PostMapping
    public Employee createEmployee(@RequestBody Employee employee) {
        // Service kullanıyoruz ki "Otomatik Kullanıcı Oluşturma" mantığı çalışsın
        return employeeService.createEmployee(employee);
    }

    // 3. Yöneticiye Bağlı Ekibi Getir
    @GetMapping("/manager/{managerId}")
    public List<Employee> getMyTeam(@PathVariable Long managerId) {
        // Service'deki ilgili metodu çağırıyoruz
        return employeeService.getTeamMembers(managerId);
    }

    // 4. Hiyerarşi ve Yönetici Atama (Yeni Eklediğimiz)
    @PostMapping("/assign-hierarchy")
    public Employee assignHierarchy(@RequestBody HierarchyAssignmentRequest request) {
        return employeeService.assignHierarchy(request);
    }
    
    // 5. Kök Kullanıcıları Getir (Org. Şeması için)
    @GetMapping("/roots")
    public List<Employee> getRootEmployees() {
        return employeeService.getRootEmployees();
    }
    
    // 6. ID ile Getir (Opsiyonel ama yararlı)
    @GetMapping("/{id}")
    public Employee getEmployeeById(@PathVariable Long id) {
        return employeeService.getEmployeeById(id);
    }
}