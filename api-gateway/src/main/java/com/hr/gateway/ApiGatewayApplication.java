package com.hr.gateway;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.annotation.Bean;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.reactive.CorsWebFilter;
import org.springframework.web.cors.reactive.UrlBasedCorsConfigurationSource;

import java.util.Arrays;

@SpringBootApplication
public class ApiGatewayApplication {

	public static void main(String[] args) {
		SpringApplication.run(ApiGatewayApplication.class, args);
	}

    // CORS AYARLARI (Frontend'in Backend ile konuşması için şart)
	@Bean
	public CorsWebFilter corsWebFilter() {
		CorsConfiguration corsConfig = new CorsConfiguration();
		// 1. Hangi adresten gelen isteklere izin verilsin? (Next.js adresi)
		corsConfig.setAllowedOrigins(Arrays.asList("http://localhost:3000"));
		// 2. Hangi metodlara izin verilsin?
		corsConfig.setMaxAge(3600L); // Önbellek süresi
		corsConfig.addAllowedMethod("*"); // GET, POST, PUT, DELETE vb. hepsi
		corsConfig.addAllowedHeader("*"); // Authorization vb. tüm başlıklar

		UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
		source.registerCorsConfiguration("/**", corsConfig); // Tüm rotalar için geçerli
		return new CorsWebFilter(source);
	}
}