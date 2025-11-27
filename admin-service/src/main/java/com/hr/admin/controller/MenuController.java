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

    // Ağaç Yapısını Getir
    @GetMapping
    public List<MenuItemDTO> getMenuTree() {
        List<MenuItem> roots = repository.findByParentIsNullOrderBySortOrderAsc();
        return roots.stream().map(this::convertToDTO).collect(Collectors.toList());
    }

    // Yeni Menü Ekle
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

    // Menüyü Güncelle (Sıralama veya İçerik)
    @PutMapping("/{id}")
    public MenuItem update(@PathVariable Long id, @RequestBody MenuItemDTO dto) {
        MenuItem item = repository.findById(id).orElseThrow();
        item.setTitle(dto.getTitle());
        item.setUrl(dto.getUrl());
        item.setSortOrder(dto.getSortOrder());
        item.setRoles(dto.getRoles());
        // Parent değişimi vb. buraya eklenebilir
        return repository.save(item);
    }

    // Sil
    @DeleteMapping("/{id}")
    public void delete(@PathVariable Long id) {
        repository.deleteById(id);
    }

    // Helper: Entity -> DTO (Recursive)
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
    @Transactional // Çoklu işlem olduğu için Transactional şart
    public void updateOrder(@RequestBody List<MenuItemDTO> items) {
        for (MenuItemDTO dto : items) {
            MenuItem item = repository.findById(dto.getId()).orElse(null);
            if (item != null) {
                item.setSortOrder(dto.getSortOrder());
                repository.save(item);
            }
        }
    }
}