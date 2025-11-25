package com.hr.document.entity;

import jakarta.persistence.*;
import lombok.Data;
import java.time.LocalDate;

@Entity
@Table(name = "document_requests")
@Data
public class DocumentRequest {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private Long employeeId; // Talep eden kişi

    // Belge Türü (Çalışma Belgesi, Vize Yazısı, Bordro vb.)
    @Column(nullable = false)
    private String documentType;

    // Ekstra Açıklama veya Kurum Adı (Örn: "Konsolosluğa verilmek üzere")
    private String description;

    // Durum: REQUESTED, PREPARED, DELIVERED
    private String status = "REQUESTED";

    private LocalDate requestedAt = LocalDate.now();

    // İşi üzerine alan İK personelinin ID'si
    private Long assignedHrId;
}