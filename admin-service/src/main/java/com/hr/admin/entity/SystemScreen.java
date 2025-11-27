package com.hr.admin.entity;

import jakarta.persistence.*;
import lombok.Data;

@Entity
@Table(name = "system_screens")
@Data
public class SystemScreen {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String name; 

    @Column(nullable = false)
    private String url;  
}