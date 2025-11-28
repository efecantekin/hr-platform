package com.hr.recruitment.controller;

import com.hr.recruitment.entity.Candidate;
import com.hr.recruitment.repository.CandidateRepository;
import com.hr.recruitment.repository.CandidateSpecs;

import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/candidates")
@RequiredArgsConstructor
public class CandidateController {

    private final CandidateRepository repository;

    @GetMapping("/search")
    public List<Candidate> search(
            @RequestParam(required = false) String technologies,
            @RequestParam(required = false) Integer experienceYears,
            @RequestParam(required = false) String university,
            @RequestParam(required = false) String department,
            @RequestParam(required = false) String referenceType
    ) {
        // Specification kullanarak arama yap
        return repository.findAll(
            CandidateSpecs.withDynamicFilter(technologies, experienceYears, university, department, referenceType)
        );
    }

    @GetMapping
    public List<Candidate> getAll() { return repository.findAll(); }

    @PostMapping
    public Candidate create(@RequestBody Candidate candidate) { return repository.save(candidate); }

    @PutMapping("/{id}/status")
    public Candidate updateStatus(@PathVariable Long id, @RequestParam String status) {
        Candidate c = repository.findById(id).orElseThrow();
        c.setStatus(status);
        return repository.save(c);
    }

    @PutMapping("/{id}")
    public Candidate updateCandidate(@PathVariable Long id, @RequestBody Candidate details) {
        Candidate c = repository.findById(id).orElseThrow();
        c.setFirstName(details.getFirstName());
        c.setLastName(details.getLastName());
        c.setEmail(details.getEmail());
        c.setTechnologies(details.getTechnologies());
        c.setExperienceYears(details.getExperienceYears());
        c.setUniversity(details.getUniversity());
        c.setDepartment(details.getDepartment());
        c.setStatus(details.getStatus()); // Statüyü de buradan güncelleyebilirsin
        // ... diğer alanlar
        return repository.save(c);
    }
}