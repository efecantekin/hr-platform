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
        } catch (Exception e) {
            System.err.println("Kullanıcı hesabı oluşturulamadı: " + e.getMessage());
        }
        return savedEmployee;
    }

    // --- HİYERARŞİ ATAMA ve ROL GÜNCELLEME ---
    @Transactional
    public Employee assignHierarchy(HierarchyAssignmentRequest request) {
        // 1. Önce Yöneticiyi Bul (Her durumda lazım)
        Employee manager = repository.findById(request.getManagerId())
                                     .orElseThrow(() -> new RuntimeException("Yönetici bulunamadı."));

        // 2. Yöneticinin Pozisyonunu Güncelle (Eğer yeni bilgi geldiyse)
        if (request.getManagerPosition() != null && !request.getManagerPosition().trim().isEmpty()) {
            manager.setPosition(request.getManagerPosition());
            repository.save(manager);
        }
        
        // 3. Yöneticinin Rolünü "MANAGER" Olarak Güncelle (HER DURUMDA ÇALIŞMALI)
        // Pozisyon değişse de değişmese de, altına adam aldıysa yöneticidir.
        try {
            System.out.println("Yönetici rolü güncelleniyor: EmployeeID=" + manager.getId());
            authClient.updateUserRole(manager.getId(), "MANAGER");
            System.out.println("Yönetici rolü başarıyla güncellendi.");
        } catch (Exception e) {
            System.err.println("DİKKAT: Yönetici rolü güncellenemedi! Hata: " + e.getMessage());
            // Hata fırlatmıyoruz, çünkü atama işlemi rol güncellemesinden daha kritik.
        }

        // 4. Ast'ı Yöneticiye Bağla
        Employee subordinate = repository.findById(request.getSubordinateId())
                                         .orElseThrow(() -> new RuntimeException("Çalışan bulunamadı."));
        
        if (request.getSubordinateId().equals(request.getManagerId())) {
            throw new RuntimeException("Kişi kendi kendini atayamaz.");
        }
        
        subordinate.setManagerId(request.getManagerId());
        return repository.save(subordinate);
    }
    
    public List<Employee> getAllEmployees() { return repository.findAll(); }
    public Employee getEmployeeById(Long id) { return repository.findById(id).orElseThrow(() -> new RuntimeException("Çalışan bulunamadı")); }
    public List<Employee> getRootEmployees() { return repository.findByManagerIdIsNull(); }
    public List<Employee> getTeamMembers(Long managerId) { return repository.findByManagerId(managerId); }
    
    @Transactional
    public Employee updateEmployee(Long id, Employee details) {
        Employee existingEmployee = repository.findById(id).orElseThrow(() -> new RuntimeException("Personel bulunamadı id: " + id));
        existingEmployee.setFirstName(details.getFirstName());
        existingEmployee.setLastName(details.getLastName());
        existingEmployee.setEmail(details.getEmail());
        existingEmployee.setDepartment(details.getDepartment());
        existingEmployee.setJobTitle(details.getJobTitle());
        existingEmployee.setPosition(details.getPosition());
        existingEmployee.setPhoneNumber(details.getPhoneNumber());
        existingEmployee.setHireDate(details.getHireDate());
        return repository.save(existingEmployee);
    }
}