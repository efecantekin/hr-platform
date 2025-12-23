package com.hr.employee.controller;

import com.hr.employee.dto.JobTitleRequest; // DTO'yu import et
import com.hr.employee.entity.Department;
import com.hr.employee.entity.JobTitle;
import com.hr.employee.repository.DepartmentRepository;
import com.hr.employee.repository.JobTitleRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/job-titles")
@RequiredArgsConstructor
public class JobTitleController {

    private final JobTitleRepository repository;
    private final DepartmentRepository departmentRepository; // Departmanları bulmak için

    @GetMapping
    public List<JobTitle> getAll() {
        return repository.findAll();
    }

    // GÜNCELLENEN METOT: Artık DTO alıyor
    @PostMapping
    public JobTitle create(@RequestBody JobTitleRequest request) {
        JobTitle jobTitle = new JobTitle();
        jobTitle.setTitle(request.getTitle());

        // Departmanı bul ve set et
        if (request.getDepartmentId() != null) {
            Department dept = departmentRepository.findById(request.getDepartmentId())
                    .orElseThrow(() -> new RuntimeException("Departman bulunamadı"));
            jobTitle.setDepartment(dept);
        }

        return repository.save(jobTitle);
    }

    @DeleteMapping("/{id}")
    public void delete(@PathVariable Long id) {
        repository.deleteById(id);
    }
}