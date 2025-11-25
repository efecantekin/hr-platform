package com.hr.employee.repository;

import com.hr.employee.entity.Employee;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface EmployeeRepository extends JpaRepository<Employee, Long> {
    // JpaRepository sayesinde save, findAll, findById gibi metodlar hazır gelir.
    // Ekstra kod yazmaya gerek yok!
    List<Employee> findByManagerId(Long managerId);
    // Yöneticisi olmayanları (En tepe isimleri) bul
    List<Employee> findByManagerIdIsNull();
}