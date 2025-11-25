package com.hr.gateway.filter;

import org.springframework.cloud.gateway.filter.GatewayFilter;
import org.springframework.cloud.gateway.filter.factory.AbstractGatewayFilterFactory;
import org.springframework.http.HttpHeaders;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestTemplate;

@Component
public class AuthenticationFilter extends AbstractGatewayFilterFactory<AuthenticationFilter.Config> {

    private final RestTemplate restTemplate;

    public AuthenticationFilter() {
        super(Config.class);
        this.restTemplate = new RestTemplate();
    }

    @Override
    public GatewayFilter apply(Config config) {
        return (exchange, chain) -> {
            // 1. İstek gelen adrese bak, eğer korunması gereken bir yerse kontrol et
            if (exchange.getRequest().getHeaders().containsKey(HttpHeaders.AUTHORIZATION)) {

                // Header'dan token'ı al ("Bearer eyJhbG..." formatında gelir)
                String authHeader = exchange.getRequest().getHeaders().get(HttpHeaders.AUTHORIZATION).get(0);
                if (authHeader != null && authHeader.startsWith("Bearer ")) {
                    authHeader = authHeader.substring(7); // "Bearer " kısmını at
                }

                try {
                    // 2. Auth Service'e sor: "Bu token geçerli mi?"
                    // REST çağrısı yapıyoruz (Gateway -> Auth Service)
                    String authServiceUrl = System.getenv("AUTH_URI");
                    if (authServiceUrl == null || authServiceUrl.isEmpty()) {
                        authServiceUrl = "http://localhost:8082";
                    }

                    // URL'in sonuna validate endpointini ekle
                    // (Docker compose'da AUTH_URI=http://auth-service:8082 olarak tanımlamıştık)
                    String finalUrl = authServiceUrl + "/auth/validate?token=" + authHeader;

                    restTemplate.getForObject(finalUrl, String.class);

                } catch (Exception e) {
                    // Token geçersizse hata fırlat
                    System.err.println("Token doğrulama hatası: " + e.getMessage()); // Loga bas ki görelim
                    throw new RuntimeException("Yetkisiz Erişim! Token geçersiz.");
                }
            } else {
                throw new RuntimeException("Yetkisiz Erişim! Header eksik.");
            }

            // Her şey yolundaysa kapıyı aç, isteği devam ettir
            return chain.filter(exchange);
        };
    }

    public static class Config {
        // Konfigürasyon gerekirse buraya eklenir
    }
}