package com.hr.admin.controller;

import com.hr.admin.entity.SystemScreen;
import com.hr.admin.repository.SystemScreenRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/screens")
@RequiredArgsConstructor
public class SystemScreenController {

    private final SystemScreenRepository repository;

    @GetMapping
    public List<SystemScreen> getAll() {
        return repository.findAll();
    }

    @PostMapping
    public SystemScreen create(@RequestBody SystemScreen screen) {
        return repository.save(screen);
    }

    @DeleteMapping("/{id}")
    public void delete(@PathVariable Long id) {
        repository.deleteById(id);
    }
}