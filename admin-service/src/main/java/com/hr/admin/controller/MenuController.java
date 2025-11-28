package com.hr.admin.controller;

import com.hr.admin.dto.MenuItemDTO;
import com.hr.admin.entity.MenuItem;
import com.hr.admin.repository.MenuItemRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/menus")
@RequiredArgsConstructor
public class MenuController {

    private final MenuItemRepository repository;

    
    @GetMapping
    public List<MenuItemDTO> getMenuTree() {
        List<MenuItem> roots = repository.findByParentIsNullOrderBySortOrderAsc();
        return roots.stream().map(this::convertToDTO).collect(Collectors.toList());
    }

    @PostMapping
    public MenuItem create(@RequestBody MenuItemDTO dto) {
        MenuItem item = new MenuItem();
        item.setTitle(dto.getTitle());
        item.setUrl(dto.getUrl());
        item.setSortOrder(dto.getSortOrder());
        item.setRoles(dto.getRoles());
        
        if (dto.getParentId() != null) {
            MenuItem parent = repository.findById(dto.getParentId()).orElseThrow();
            item.setParent(parent);
        }
        return repository.save(item);
    }

@PutMapping("/{id}")
    @Transactional // İlişki güncellemeleri için Transactional önerilir
    public MenuItem update(@PathVariable Long id, @RequestBody MenuItemDTO dto) {
        // 1. Düzenlenen menüyü bul
        MenuItem item = repository.findById(id)
                .orElseThrow(() -> new RuntimeException("Menü bulunamadı id: " + id));

        // 2. Temel alanları güncelle
        item.setTitle(dto.getTitle());
        item.setUrl(dto.getUrl());
        item.setRoles(dto.getRoles());
        // SortOrder'ı formdan güncellemek istemeyebiliriz (DnD bozulmasın diye), 
        // ama istersen: item.setSortOrder(dto.getSortOrder());

        // 3. PARENT İLİŞKİSİNİ GÜNCELLE (KRİTİK KISIM)
        if (dto.getParentId() != null) {
            // Kendisini parent yapmaya çalışırsa engelle
            if (item.getId().equals(dto.getParentId())) {
                throw new RuntimeException("Bir menü kendisinin alt menüsü olamaz!");
            }

            MenuItem newParent = repository.findById(dto.getParentId())
                    .orElseThrow(() -> new RuntimeException("Seçilen üst menü bulunamadı."));
            
            item.setParent(newParent); // Yeni babasına bağla
        } else {
            // Parent ID null geldiyse, bu artık bir KÖK (Root) menüdür.
            item.setParent(null); 
        }

        return repository.save(item);
    }

    @DeleteMapping("/{id}")
    public void delete(@PathVariable Long id) {
        repository.deleteById(id);
    }

    private MenuItemDTO convertToDTO(MenuItem item) {
        MenuItemDTO dto = new MenuItemDTO();
        dto.setId(item.getId());
        dto.setTitle(item.getTitle());
        dto.setUrl(item.getUrl());
        dto.setSortOrder(item.getSortOrder());
        dto.setRoles(item.getRoles());
        if(item.getParent() != null) dto.setParentId(item.getParent().getId());
        
        if (item.getChildren() != null) {
            dto.setChildren(item.getChildren().stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList()));
        }
        return dto;
    }

@PutMapping("/update-order")
    @Transactional
    public void updateOrder(@RequestBody List<MenuItemDTO> items) {
        for (MenuItemDTO dto : items) {
            MenuItem item = repository.findById(dto.getId()).orElse(null);
            if (item != null) {
                // 1. Sıralamayı Güncelle
                item.setSortOrder(dto.getSortOrder());
                
                // 2. Parent'ı Güncelle (Kırılım Değişikliği)
                if (dto.getParentId() != null) {
                    MenuItem parent = repository.findById(dto.getParentId()).orElse(null);
                    item.setParent(parent);
                } else {
                    item.setParent(null); // Köke taşındıysa
                }
                
                repository.save(item);
            }
        }
    }
}