package com.hr.admin.repository;
import com.hr.admin.entity.MenuItem;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface MenuItemRepository extends JpaRepository<MenuItem, Long> {
    // Sadece en tepedeki kök menüleri getir (Parent'ı null olanlar)
    List<MenuItem> findByParentIsNullOrderBySortOrderAsc();
}