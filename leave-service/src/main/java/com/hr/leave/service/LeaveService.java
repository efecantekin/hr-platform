package com.hr.leave.service;

import com.hr.leave.client.EmployeeClient;
// NotificationClient importunu sildik çünkü artık RabbitMQ kullanacağız
import com.hr.leave.config.RabbitMQConfig;
import com.hr.leave.event.LeaveCreatedEvent;
import com.hr.leave.entity.LeaveRequest;
import com.hr.leave.repository.LeaveRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.amqp.rabbit.core.RabbitTemplate; // <--- YENİ: RabbitTemplate
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class LeaveService {

    private final LeaveRepository repository;
    private final EmployeeClient employeeClient;
    
    // Feign yerine RabbitMQ Template kullanıyoruz
    private final RabbitTemplate rabbitTemplate;

    // --- 1. İZİN TALEBİ OLUŞTURMA (EVENT DRIVEN) ---
    @Transactional
    public LeaveRequest createLeaveRequest(LeaveRequest request) {
        // 1. Önce talebi veritabanına kaydet
        LeaveRequest savedRequest = repository.save(request);

        try {
            // İzni isteyen personelin bilgilerini çek
            EmployeeClient.EmployeeDto employee = employeeClient.getEmployeeById(request.getEmployeeId());

            // Eğer yöneticisi varsa, yöneticiye bildirim için olay fırlat
            if (employee != null && employee.getManagerId() != null) {
                EmployeeClient.EmployeeDto manager = employeeClient.getEmployeeById(employee.getManagerId());

                if (manager != null) {
                    // EVENT OLUŞTUR
                    LeaveCreatedEvent event = new LeaveCreatedEvent(
                        manager.getId(),
                        employee.getFirstName() + " " + employee.getLastName(),
                        manager.getEmail(),
                        request.getStartDate().toString(),
                        request.getEndDate().toString()
                    );

                    // RABBITMQ'YA FIRLAT
                    // (Exchange Adı, Routing Key, Veri)
                    rabbitTemplate.convertAndSend(RabbitMQConfig.EXCHANGE_NAME, "notification.leave.created", event);
                    
                    System.out.println("🐇 Mesaj kuyruğa atıldı: " + event);
                }
            }
        } catch (Exception e) {
            // RabbitMQ kapalı olsa bile izin kaydı bozulmasın, sadece logla
            System.err.println("Event hatası: " + e.getMessage());
        }

        return savedRequest;
    }

    // --- 2. YÖNETİCİYE ÖZEL BEKLEYEN İZİNLERİ GETİR ---
    public List<LeaveRequest> getPendingLeavesForManager(Long managerId) {
        try {
            List<EmployeeClient.EmployeeDto> team = employeeClient.getEmployeesByManager(managerId);
            
            if (team == null || team.isEmpty()) {
                return new ArrayList<>();
            }

            List<Long> teamIds = team.stream()
                                    .map(EmployeeClient.EmployeeDto::getId)
                                    .collect(Collectors.toList());

            if (teamIds.isEmpty()) {
                return new ArrayList<>();
            }

            return repository.findByEmployeeIdInAndStatus(teamIds, "PENDING");
            
        } catch (Exception e) {
            System.err.println("Ekip izinleri çekilemedi: " + e.getMessage());
            return new ArrayList<>();
        }
    }

    // --- DİĞER METODLAR ---

    public List<LeaveRequest> getLeavesByEmployee(Long employeeId) {
        return repository.findByEmployeeId(employeeId);
    }
    
    public List<LeaveRequest> getAllLeaves() {
        return repository.findAll();
    }

    public LeaveRequest updateLeaveStatus(Long leaveId, String newStatus) {
        LeaveRequest request = repository.findById(leaveId)
                .orElseThrow(() -> new RuntimeException("İzin bulunamadı"));
        
        request.setStatus(newStatus);
        return repository.save(request);
    }
}