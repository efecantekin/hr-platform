package com.hr.employee.repository;

import com.hr.employee.entity.Employee;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface EmployeeRepository extends JpaRepository<Employee, Long> {
    List<Employee> findByManagerId(Long managerId);
    
    List<Employee> findByManagerIdIsNull();
}