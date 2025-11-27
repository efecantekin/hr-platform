package com.hr.admin.entity;

import jakarta.persistence.*;
import lombok.Data;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "menu_items")
@Data
public class MenuItem {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String title; // Menüde görünecek yazı

    private String url;   // Tıklanınca gideceği yol (Boşsa sadece başlık olur)
    
    private String icon;  // İkon adı (Opsiyonel)

    private int sortOrder; // Sıralama indeksi

    // Hiyerarşi için Parent-Child ilişkisi
    @ManyToOne
    @JoinColumn(name = "parent_id")
    private MenuItem parent;

    // Alt menüleri çekmek için (Eager fetch yerine serviste tree kurmak daha performanslıdır ama basitlik için böyle yapalım)
    @OneToMany(mappedBy = "parent", cascade = CascadeType.ALL)
    @OrderBy("sortOrder ASC")
    private List<MenuItem> children = new ArrayList<>();

    @ElementCollection(fetch = FetchType.EAGER)
    @CollectionTable(name = "menu_item_roles", joinColumns = @JoinColumn(name = "menu_id"))
    @Column(name = "role")
    private List<String> roles = new ArrayList<>();
}