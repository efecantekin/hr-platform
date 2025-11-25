package com.hr.employee.service;

import com.hr.employee.client.AuthClient;
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

    // Constructor Injection
    public EmployeeService(EmployeeRepository repository, AuthClient authClient) {
        this.repository = repository;
        this.authClient = authClient;
    }

    // 1. Yeni Personel Ekle (Ve Otomatik Kullanıcı Hesabı Aç)
    @Transactional
    public Employee createEmployee(Employee employee) {
        // Önce personeli kaydet
        Employee savedEmployee = repository.save(employee);

        // Sonra Auth Service'e git ve kullanıcı aç
        try {
            // Username: Email adresi
            // Password: "123456" (Varsayılan)
            // Role: "USER"
            RegisterRequest registerRequest = new RegisterRequest(
                savedEmployee.getEmail(),
                "123456", 
                "USER",
                savedEmployee.getId()
            );
            
            authClient.registerUser(registerRequest);
            System.out.println("✅ Otomatik kullanıcı hesabı oluşturuldu: " + savedEmployee.getEmail());

        } catch (Exception e) {
            // Auth servisi kapalı olsa bile personel kaydı boşa gitmesin diye hatayı yutuyoruz (Logluyoruz)
            System.err.println("⚠️ Kullanıcı hesabı oluşturulamadı: " + e.getMessage());
        }

        return savedEmployee;
    }

    // 2. Tüm Çalışanları Getir
    public List<Employee> getAllEmployees() {
        return repository.findAll();
    }

    // 3. ID ile Getir
    public Employee getEmployeeById(Long id) {
        return repository.findById(id).orElseThrow(() -> new RuntimeException("Çalışan bulunamadı"));
    }

    // 4. Yönetici Ata (Hiyerarşi için)
    public Employee assignManager(Long employeeId, Long managerId) {
        Employee employee = getEmployeeById(employeeId);
        
        if (employeeId.equals(managerId)) {
            throw new RuntimeException("Kişi kendi kendisinin yöneticisi olamaz!");
        }

        employee.setManagerId(managerId);
        return repository.save(employee);
    }

    // 5. Yöneticisi Olmayanları Getir (Org. Şeması kökleri için)
    public List<Employee> getRootEmployees() {
        return repository.findByManagerIdIsNull();
    }

    // 6. Bir Yöneticiye Bağlı Kişileri Getir (Ekibim)
    public List<Employee> getTeamMembers(Long managerId) {
        return repository.findByManagerId(managerId);
    }
}