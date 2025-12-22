package com.hr.leave.service;

import com.hr.leave.client.EmployeeClient;
import com.hr.leave.client.NotificationClient;
import com.hr.leave.dto.NotificationRequest;
import com.hr.leave.entity.LeaveRequest;
import com.hr.leave.repository.LeaveRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class LeaveService {

    private final LeaveRepository repository;
    
    // Feign Client'ları buraya enjekte ediyoruz
    private final NotificationClient notificationClient;
    private final EmployeeClient employeeClient;

    // --- 1. İZİN TALEBİ OLUŞTURMA (BİLDİRİMLİ) ---
    @Transactional
    public LeaveRequest createLeaveRequest(LeaveRequest request) {
        // 1. Önce talebi veritabanına kaydet
        LeaveRequest savedRequest = repository.save(request);

        // 2. Bildirim Gönderme Mantığı (Try-Catch içinde olmalı ki sistem çökmesin)
        try {
            // A. İzni isteyen personelin bilgilerini çek
            EmployeeClient.EmployeeDto employee = employeeClient.getEmployeeById(request.getEmployeeId());

            // B. Eğer yöneticisi varsa, yöneticiye bildirim gönder
            if (employee.getManagerId() != null) {
                // Yöneticinin bilgilerini çek (Email'ini almak için)
                EmployeeClient.EmployeeDto manager = employeeClient.getEmployeeById(employee.getManagerId());

                // C. Bildirim nesnesini hazırla
                NotificationRequest notification = NotificationRequest.builder()
                        .userId(manager.getId()) // Kime? (Yöneticiye)
                        .title("Yeni İzin Talebi: " + employee.getFirstName() + " " + employee.getLastName())
                        .message(employee.getFirstName() + ", " + request.getStartDate() + " tarihinden itibaren izin talep etti. Onayınızı bekliyor.")
                        .targetUrl("/dashboard/leaves") // Yönetici tıkladığında buraya gitsin
                        .sendEmail(true) // Email de atılsın
                        .emailTo(manager.getEmail()) // Yöneticinin maili
                        .build();

                // D. Notification Service'e ateşle!
                notificationClient.sendNotification(notification);
                
                System.out.println("🔔 Bildirim gönderildi: Yönetici ID " + manager.getId());
            }

        } catch (Exception e) {
            // Diğer servisler kapalıysa veya hata varsa, sadece log bas, işlemi durdurma.
            // Çünkü izin talebi veritabanına başarıyla kaydedildi.
            System.err.println("⚠️ Bildirim gönderilemedi: " + e.getMessage());
        }

        return savedRequest;
    }

    public List<LeaveRequest> getPendingLeavesForManager(Long managerId) {
        // A. Yöneticinin ekibini Employee Service'den çek

        List<EmployeeClient.EmployeeDto> team = employeeClient.getEmployeesByManager(managerId);
        System.out.println("TEAM =>" + team);
        // Ekip yoksa boş liste dön
        if (team == null || team.isEmpty()) {
            return new ArrayList<>();
        }

        // B. Ekipteki çalışanların ID'lerini bir listeye topla
        List<Long> teamIds = team.stream()
                                 .map(EmployeeClient.EmployeeDto::getId)
                                 .collect(Collectors.toList());

        // C. Sadece bu ID'lere sahip ve durumu 'PENDING' olan izinleri getir
        return repository.findByEmployeeIdInAndStatus(teamIds, "PENDING");
    }

    public List<LeaveRequest> getLeavesByEmployee(Long employeeId) {
        return repository.findByEmployeeId(employeeId);
    }

    public List<LeaveRequest> getLeavesByStatus(String status) {
        return repository.findByStatus(status);
    }
    
    public List<LeaveRequest> getAllLeaves() {
        return repository.findAll();
    }

    public LeaveRequest updateLeaveStatus(Long leaveId, String newStatus) {
        LeaveRequest request = repository.findById(leaveId)
                .orElseThrow(() -> new RuntimeException("İzin bulunamadı"));
        
        request.setStatus(newStatus);
        
        // Opsiyonel: Durum değişince çalışana da bildirim atılabilir ("İzniniz Onaylandı" gibi)
        // Buraya benzer bir try-catch bloğu eklenebilir.
        
        return repository.save(request);
    }
}