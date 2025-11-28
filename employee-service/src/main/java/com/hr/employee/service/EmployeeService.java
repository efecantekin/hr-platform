package com.hr.employee.service;

import com.hr.employee.client.AuthClient;
import com.hr.employee.dto.HierarchyAssignmentRequest;
import com.hr.employee.dto.RegisterRequest;
import com.hr.employee.entity.Employee;
import com.hr.employee.repository.EmployeeRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class EmployeeService {

    private final EmployeeRepository repository;
    private final AuthClient authClient;

    
    public EmployeeService(EmployeeRepository repository, AuthClient authClient) {
        this.repository = repository;
        this.authClient = authClient;
    }

    @Transactional
    public Employee createEmployee(Employee employee) {        
        Employee savedEmployee = repository.save(employee);

        try {
            RegisterRequest registerRequest = new RegisterRequest(
                savedEmployee.getEmail(),
                "123456", 
                "USER",
                savedEmployee.getId()
            );
            
            authClient.registerUser(registerRequest);
            System.out.println("✅ Otomatik kullanıcı hesabı oluşturuldu: " + savedEmployee.getEmail());

        } catch (Exception e) {           
            System.err.println("⚠️ Kullanıcı hesabı oluşturulamadı: " + e.getMessage());
        }

        return savedEmployee;
    }

    public List<Employee> getAllEmployees() {
        return repository.findAll();
    }
  
    public Employee getEmployeeById(Long id) {
        return repository.findById(id).orElseThrow(() -> new RuntimeException("Çalışan bulunamadı"));
    }
    
    @Transactional
    public Employee assignHierarchy(HierarchyAssignmentRequest request) {       
        
        if (request.getManagerPosition() != null && !request.getManagerPosition().trim().isEmpty()) {
            Employee manager = repository.findById(request.getManagerId())
                                        .orElseThrow(() -> new RuntimeException("Yönetici bulunamadı."));
            
            manager.setPosition(request.getManagerPosition());
            repository.save(manager);
        }
               
        Employee subordinate = repository.findById(request.getSubordinateId())
                                        .orElseThrow(() -> new RuntimeException("Çalışan bulunamadı."));
               
        if (request.getSubordinateId().equals(request.getManagerId())) {
            throw new RuntimeException("Kişi kendi kendini atayamaz.");
        }
        
        subordinate.setManagerId(request.getManagerId());
        return repository.save(subordinate);
    }
    
    public List<Employee> getRootEmployees() {
        return repository.findByManagerIdIsNull();
    }
 
    public List<Employee> getTeamMembers(Long managerId) {
        return repository.findByManagerId(managerId);
    }
}
