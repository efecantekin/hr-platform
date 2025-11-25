package com.hr.auth.repository;

import com.hr.auth.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;

public interface UserRepository extends JpaRepository<User, Long> {
    // Kullanıcı adına göre arama yapacak sihirli metod
    Optional<User> findByUsername(String username);
}