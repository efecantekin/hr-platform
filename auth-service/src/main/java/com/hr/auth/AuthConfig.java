package com.hr.auth;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod; // Bu importu eklemeyi unutmayın
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;

@Configuration
@EnableWebSecurity
public class AuthConfig {

    public AuthConfig() {
        System.out.println("--------------------------------------");
        System.out.println("🔥 AUTH CONFIG DOSYASI YÜKLENİYOR! 🔥");
        System.out.println("--------------------------------------");
    }

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
            .csrf(AbstractHttpConfigurer::disable) // CSRF İPTAL
            .authorizeHttpRequests(auth -> auth
                // PUT metoduna özel izin veriyoruz (Rol güncelleme için)
                .requestMatchers(HttpMethod.PUT, "/auth/**").permitAll()
                // Diğer tüm /auth/** isteklerine (POST, GET) izin veriyoruz
                .requestMatchers("/auth/**").permitAll() 
                // Geri kalan her şey kilitli
                .anyRequest().authenticated()
            );
        return http.build();
    }

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }
}