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
   
    @PostMapping
    public Team createTeam(@RequestBody Team team) {
        return teamRepository.save(team);
    }
   
    @PutMapping("/{teamId}/manager/{employeeId}")
    public Team assignManager(@PathVariable Long teamId, @PathVariable Long employeeId) {
        Team team = teamRepository.findById(teamId).orElseThrow();
       
        team.setManagerId(employeeId);

        return teamRepository.save(team);
    }

    
    @PutMapping("/{teamId}/assign/{employeeId}")
    public Employee addEmployeeToTeam(@PathVariable Long teamId, @PathVariable Long employeeId) {
        Employee employee = employeeRepository.findById(employeeId).orElseThrow();
        employee.setTeamId(teamId);
        return employeeRepository.save(employee);
    }
   
    @GetMapping
    public List<Team> getAllTeams() {
        return teamRepository.findAll();
    }
}