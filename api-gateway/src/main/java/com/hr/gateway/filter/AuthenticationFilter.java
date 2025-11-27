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
            if (exchange.getRequest().getHeaders().containsKey(HttpHeaders.AUTHORIZATION)) {
         
                String authHeader = exchange.getRequest().getHeaders().get(HttpHeaders.AUTHORIZATION).get(0);
                if (authHeader != null && authHeader.startsWith("Bearer ")) {
                    authHeader = authHeader.substring(7); 
                }

                try {
                    String authServiceUrl = System.getenv("AUTH_URI");
                    if (authServiceUrl == null || authServiceUrl.isEmpty()) {
                        authServiceUrl = "http://localhost:8082";
                    }
  
                    String finalUrl = authServiceUrl + "/auth/validate?token=" + authHeader;

                    restTemplate.getForObject(finalUrl, String.class);

                } catch (Exception e) {       
                    System.err.println("Token doğrulama hatası: " + e.getMessage()); 
                    throw new RuntimeException("Yetkisiz Erişim! Token geçersiz.");
                }
            } else {
                throw new RuntimeException("Yetkisiz Erişim! Header eksik.");
            }

            return chain.filter(exchange);
        };
    }

    public static class Config {
    }
}