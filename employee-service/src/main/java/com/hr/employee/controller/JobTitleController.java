package com.hr.employee.controller;

import com.hr.employee.entity.JobTitle;
import com.hr.employee.repository.JobTitleRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/job-titles")
@RequiredArgsConstructor
public class JobTitleController {
    private final JobTitleRepository repository;

    @GetMapping
    public List<JobTitle> getAll() { return repository.findAll(); }

    @PostMapping
    public JobTitle create(@RequestBody JobTitle title) { return repository.save(title); }

    @DeleteMapping("/{id}")
    public void delete(@PathVariable Long id) { repository.deleteById(id); }
}