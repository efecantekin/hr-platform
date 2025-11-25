package com.hr.employee.controller;

import com.hr.employee.entity.Employee;
import com.hr.employee.entity.Team;
import com.hr.employee.repository.EmployeeRepository;
import com.hr.employee.repository.TeamRepository;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/teams")
public class TeamController {

    private final TeamRepository teamRepository;
    private final EmployeeRepository employeeRepository;

    public TeamController(TeamRepository teamRepository, EmployeeRepository employeeRepository) {
        this.teamRepository = teamRepository;
        this.employeeRepository = employeeRepository;
    }

    // 1. Yeni Ekip Oluştur
    @PostMapping
    public Team createTeam(@RequestBody Team team) {
        return teamRepository.save(team);
    }

    // 2. Ekibe Yönetici Ata
    @PutMapping("/{teamId}/manager/{employeeId}")
    public Team assignManager(@PathVariable Long teamId, @PathVariable Long employeeId) {
        Team team = teamRepository.findById(teamId).orElseThrow();

        // Ekibin yöneticisini güncelle
        team.setManagerId(employeeId);

        // Çalışanın da managerId'sini kendine eşitle (Kendi kendinin yöneticisi olmasın
        // ama hiyerarşi için gerekebilir)
        // Veya daha önemlisi: O ekibe atanan kişilerin managerId'si bu kişi olacak.

        return teamRepository.save(team);
    }

    // 3. Ekibe Personel Ata
    @PutMapping("/{teamId}/assign/{employeeId}")
    public Employee addEmployeeToTeam(@PathVariable Long teamId, @PathVariable Long employeeId) {
        // Sadece teamId'yi güncelle, managerId'ye dokunma!
        // Çünkü bu kişi o ekipte çalışıyor olabilir ama yöneticisi başka bir "Chapter
        // Lead" olabilir.
        Employee employee = employeeRepository.findById(employeeId).orElseThrow();
        employee.setTeamId(teamId);
        return employeeRepository.save(employee);
    }

    // 4. Tüm Ekipleri Listele
    @GetMapping
    public List<Team> getAllTeams() {
        return teamRepository.findAll();
    }
}