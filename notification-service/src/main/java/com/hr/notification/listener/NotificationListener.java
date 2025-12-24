package com.hr.notification.listener;

import com.hr.notification.event.LeaveCreatedEvent;
import com.hr.notification.event.EmployeeAssignedEvent;
import com.hr.notification.entity.Notification;
import com.hr.notification.service.NotificationService;
import lombok.RequiredArgsConstructor;
import org.springframework.amqp.rabbit.annotation.RabbitListener;
import org.springframework.amqp.rabbit.annotation.RabbitHandler;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
@RabbitListener(queues = "notification-queue")
public class NotificationListener {

    private final NotificationService notificationService;

    /**
     * RabbitMQ kuyruğunu dinleyen metot.
     * Mesaj geldiğinde JSON verisi otomatik olarak LeaveCreatedEvent nesnesine dönüştürülür.
     */
    @RabbitHandler
    public void handleLeaveEvent(LeaveCreatedEvent event) {
        System.out.println("📩 RabbitMQ: Yeni bir izin mesajı alındı.");
        
        // Güvenlik Kontrolü: Eğer event içeriği boşsa işlemi durdur
        if (event == null || event.getManagerId() == null) {
            System.err.println("❌ HATA: Gelen event verisi eksik veya ManagerId bulunamadı! Event: " + event);
            return;
        }

        System.out.println("🔍 İşleniyor -> Çalışan: " + event.getEmployeeName() + " | Yönetici ID: " + event.getManagerId());

        try {
            // 1. Gelen Event verisinden bir Bildirim (Notification) nesnesi oluştur
            Notification notification = new Notification();
            notification.setUserId(event.getManagerId());
            notification.setTitle("Yeni İzin Talebi");
            
            // Daha detaylı ve profesyonel bir mesaj metni
            String detailMessage = String.format("%s, %s - %s tarihleri için izin talebinde bulundu.", 
                                            event.getEmployeeName(), 
                                            event.getStartDate(), 
                                            event.getEndDate());
            
            notification.setMessage(detailMessage);
            notification.setTargetUrl("/dashboard/leaves"); 
            notification.setSendEmail(true); 
            notification.setEmailTo(event.getManagerEmail()); 

            // 2. Bildirimi servise gönder.
            notificationService.createNotification(notification);
            
            System.out.println("✅ BAŞARILI: Bildirim veritabanına kaydedildi ve yöneticiye (ID: " + event.getManagerId() + ") yönlendirildi.");
            
        } catch (Exception e) {
            // Hata durumunda detaylı log basıyoruz ki sorunu terminalden görebilelim
            System.err.println("❌ KRİTİK HATA: Bildirim işlenirken bir sorun oluştu!");
            System.err.println("Hata Mesajı: " + e.getMessage());
            e.printStackTrace();
        }
    }

        /**
     * Hiyerarşi ataması yapıldığında tetiklenen mesajları dinler.
     * Hem yöneticiye hem de çalışana bildirim gönderir.
     */
   @RabbitHandler
    public void handleEmployeeAssigned(EmployeeAssignedEvent event) {
        System.out.println("📩 Bildirim Servisi: Hiyerarşi atama mesajı işleniyor...");

        try {
            // 1. YÖNETİCİ İÇİN BİLDİRİM OLUŞTUR
            Notification managerNotification = new Notification();
            managerNotification.setUserId(event.getManagerId());
            managerNotification.setTitle("Ekibinize Yeni Üye Katıldı");
            managerNotification.setMessage(String.format(
                "%s tarihi itibariyle %s ekibinizde çalışmaya başlamıştır.",
                event.getAssignmentDate(),
                event.getEmployeeName()
            ));
            managerNotification.setTargetUrl("/dashboard/organization");
            managerNotification.setSendEmail(true);
            managerNotification.setEmailTo(event.getManagerEmail());
            
            notificationService.createNotification(managerNotification);

            // 2. ÇALIŞAN İÇİN BİLDİRİM OLUŞTUR
            Notification employeeNotification = new Notification();
            employeeNotification.setUserId(event.getEmployeeId());
            employeeNotification.setTitle("Yönetici Ataması Gerçekleşti");
            employeeNotification.setMessage(String.format(
                "%s tarihi itibariyle %s isimli yöneticinin ekibinde çalışmaya başladınız.",
                event.getAssignmentDate(),
                event.getManagerName()
            ));
            employeeNotification.setTargetUrl("/dashboard/profile");
            employeeNotification.setSendEmail(true);
            employeeNotification.setEmailTo(event.getEmployeeEmail());

            notificationService.createNotification(employeeNotification);

            System.out.println("✅ Başarılı: Yönetici (" + event.getManagerName() + ") ve Çalışan (" + event.getEmployeeName() + ") için bildirimler oluşturuldu.");
            
        } catch (Exception e) {
            System.err.println("❌ Bildirim oluşturma hatası: " + e.getMessage());
        }
    }
}