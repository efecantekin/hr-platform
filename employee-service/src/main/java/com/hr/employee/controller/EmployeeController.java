package com.hr.employee.controller;

import com.hr.employee.entity.Employee;
import com.hr.employee.repository.EmployeeRepository;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/employees")
public class EmployeeController {

    private final EmployeeRepository employeeRepository;

    // Bağımlılığı enjekte ediyoruz (Constructor Injection)
    public EmployeeController(EmployeeRepository employeeRepository) {
        this.employeeRepository = employeeRepository;
    }

    // Tüm çalışanları getir
    @GetMapping
    public List<Employee> getAllEmployees() {
        return employeeRepository.findAll();
    }

    // Yeni çalışan ekle
    @PostMapping
    public Employee createEmployee(@RequestBody Employee employee) {
        return employeeRepository.save(employee);
    }

    // Yöneticiye bağlı ekibi getir
    @GetMapping("/manager/{managerId}")
    public List<Employee> getMyTeam(@PathVariable Long managerId) {
        return employeeRepository.findByManagerId(managerId);
    }

    @PutMapping("/{employeeId}/assign-manager/{managerId}")
    public Employee assignManager(@PathVariable Long employeeId, @PathVariable Long managerId) {
        Employee employee = employeeRepository.findById(employeeId)
                .orElseThrow(() -> new RuntimeException("Çalışan bulunamadı"));

        // Döngüsel referans kontrolü (Ahmet'i Mehmet'e, Mehmet'i Ahmet'e bağlayamazsın)
        if (employeeId.equals(managerId)) {
            throw new RuntimeException("Kişi kendi kendisinin yöneticisi olamaz!");
        }

        employee.setManagerId(managerId);
        return employeeRepository.save(employee);
    }

    // 2. YÖNETİCİSİ OLMAYANLARI GETİR (Root Nodes / CEO / Tepe Yönetim)
    // Ağacı en tepeden çizmeye başlamak için lazım olacak.
    @GetMapping("/roots")
    public List<Employee> getRootEmployees() {
        // managerId'si null olanları getirir (Repository'e bu metodu eklememiz lazım)
        return employeeRepository.findByManagerIdIsNull();
    }
}