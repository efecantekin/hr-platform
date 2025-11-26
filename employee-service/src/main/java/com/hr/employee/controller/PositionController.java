package com.hr.employee.controller;

import com.hr.employee.entity.Position;
import com.hr.employee.repository.PositionRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/positions")
@RequiredArgsConstructor
public class PositionController {

    private final PositionRepository repository;

    @GetMapping
    public List<Position> getAll() {
        return repository.findAll();
    }

    @PostMapping
    public Position create(@RequestBody Position position) {
        return repository.save(position);
    }

    @PutMapping("/{id}")
    public Position update(@PathVariable Long id, @RequestBody Position position) {
        Position existing = repository.findById(id).orElseThrow();
        existing.setTitle(position.getTitle());
        return repository.save(existing);
    }

    @DeleteMapping("/{id}")
    public void delete(@PathVariable Long id) {
        repository.deleteById(id);
    }
}