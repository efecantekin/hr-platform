package com.hr.admin.dto;
import lombok.Data;
import java.util.List;

@Data
public class MenuItemDTO {
    private Long id;
    private String title;
    private String url;
    private int sortOrder;
    private Long parentId;
    private List<MenuItemDTO> children;
    private List<String> roles;
}