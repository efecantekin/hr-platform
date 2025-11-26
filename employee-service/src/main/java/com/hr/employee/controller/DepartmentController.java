package com.hr.employee.controller;

import com.hr.employee.entity.Department;
import com.hr.employee.repository.DepartmentRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/departments")
@RequiredArgsConstructor
public class DepartmentController {
    private final DepartmentRepository repository;

    @GetMapping
    public List<Department> getAll() { return repository.findAll(); }

    @PostMapping
    public Department create(@RequestBody Department dep) { return repository.save(dep); }

    @DeleteMapping("/{id}")
    public void delete(@PathVariable Long id) { repository.deleteById(id); }
}