package com.hr.employee.service;

import com.hr.employee.client.AuthClient;
import com.hr.employee.dto.HierarchyAssignmentRequest;
import com.hr.employee.dto.RegisterRequest;
import com.hr.employee.entity.Employee;
import com.hr.employee.event.EmployeeAssignedEvent;
import com.hr.employee.repository.EmployeeRepository;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.amqp.rabbit.core.RabbitTemplate;
import java.time.LocalDate;
import java.util.List;

@Service
@Slf4j
public class EmployeeService {

    private final EmployeeRepository repository;
    private final AuthClient authClient;
    private final RabbitTemplate rabbitTemplate;

    public EmployeeService(EmployeeRepository repository, AuthClient authClient, RabbitTemplate rabbitTemplate) {
        this.repository = repository;
        this.authClient = authClient;
        this.rabbitTemplate = rabbitTemplate;
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
            log.error("Kullanıcı hesabı oluşturulamadı: {}", e.getMessage());
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
            log.info("Yönetici rolü güncelleniyor: EmployeeID={}", manager.getId());
            authClient.updateUserRole(manager.getId(), "MANAGER");
            log.info("Yönetici rolü başarıyla güncellendi.");
        } catch (Exception e) {
            log.error("DİKKAT: Yönetici rolü güncellenemedi! Hata: {}", e.getMessage());
            // Hata fırlatmıyoruz, çünkü atama işlemi rol güncellemesinden daha kritik.
        }

        // 4. Ast'ı Yöneticiye Bağla
        Employee subordinate = repository.findById(request.getSubordinateId())
                                         .orElseThrow(() -> new RuntimeException("Çalışan bulunamadı."));
        
        if (request.getSubordinateId().equals(request.getManagerId())) {
            throw new RuntimeException("Kişi kendi kendini atayamaz.");
        }
        
                subordinate.setManagerId(request.getManagerId());
        Employee savedSub = repository.save(subordinate);

        // --- YENİ: EVENT GÖNDERİMİ ---
        try {
            EmployeeAssignedEvent event = new EmployeeAssignedEvent(
                savedSub.getId(),
                savedSub.getFirstName() + " " + savedSub.getLastName(),
                savedSub.getEmail(),
                manager.getId(),
                manager.getFirstName() + " " + manager.getLastName(),
                manager.getEmail(),
                LocalDate.now()
            );

            // RabbitMQ'ya gönder (Routing key: notification.employee.assigned)
            rabbitTemplate.convertAndSend("hr-exchange", "notification.employee.assigned", event);
            System.out.println("🐇 Hiyerarşi atama eventi gönderildi.");
        } catch (Exception e) {
            System.err.println("Event gönderim hatası: " + e.getMessage());
        }

        return savedSub;
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