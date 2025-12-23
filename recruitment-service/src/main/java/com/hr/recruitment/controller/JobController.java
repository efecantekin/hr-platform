package com.hr.recruitment.controller;

import com.hr.recruitment.entity.*;
import com.hr.recruitment.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/jobs")
@RequiredArgsConstructor
public class JobController {

    private final JobPositionRepository positionRepository;
    private final JobApplicationRepository applicationRepository;

    // --- POZİSYONLAR ---
    @GetMapping
    public List<JobPosition> getAllPositions() {
        return positionRepository.findAll();
    }

    @GetMapping("/{id}")
    public JobPosition getPosition(@PathVariable Long id) {
        return positionRepository.findById(id).orElseThrow();
    }

    @PostMapping
    public JobPosition createPosition(@RequestBody JobPosition position) {
        return positionRepository.save(position);
    }

    // --- BAŞVURU SÜRECİ ---
    @PostMapping("/{id}/apply")
    public JobApplication addCandidate(@PathVariable Long id, @RequestBody JobApplication application) {
        JobPosition position = positionRepository.findById(id).orElseThrow();
        application.setJobPosition(position);
        application.setStatus(ApplicationStatus.BASVURU_ALINDI); // İlk statü
        return applicationRepository.save(application);
    }

    @PutMapping("/applications/{appId}/status")
    public JobApplication updateStatus(@PathVariable Long appId, @RequestParam ApplicationStatus status) {
        JobApplication app = applicationRepository.findById(appId).orElseThrow();
        app.setStatus(status);
        return applicationRepository.save(app);
    }
}