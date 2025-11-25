package com.hr.auth.service;

import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.SignatureAlgorithm;
import io.jsonwebtoken.io.Decoders;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.security.Key;
import java.util.Date;
import java.util.HashMap;
import java.util.Map;

@Service
public class JwtService {

    @Value("${jwt.secret}")
    private String secretKey;

    @Value("${jwt.expiration}")
    private long jwtExpiration;

    // Token Üretme Metodu
    public String generateToken(String username) {
        Map<String, Object> claims = new HashMap<>();
        return createToken(claims, username);
    }

    private String createToken(Map<String, Object> claims, String subject) {
        return Jwts.builder()
                .setClaims(claims)
                .setSubject(subject) // Token kime ait? (Username)
                .setIssuedAt(new Date(System.currentTimeMillis())) // Ne zaman üretildi?
                .setExpiration(new Date(System.currentTimeMillis() + jwtExpiration)) // Ne zaman ölecek?
                .signWith(getSigningKey(), SignatureAlgorithm.HS256) // İmzala
                .compact();
    }

    // Gizli anahtarı byte dizisine çeviren yardımcı metod
    private Key getSigningKey() {
        byte[] keyBytes = Decoders.BASE64.decode(secretKey);
        return Keys.hmacShaKeyFor(keyBytes);
    }
    
    // Token'dan kullanıcı adını okuma (İleride lazım olacak)
    // Validasyon işlemleri de buraya eklenecek

    // 1. Token'ın içinden kullanıcı adını söküp alma
    public String extractUsername(String token) {
        return Jwts.parserBuilder()
                .setSigningKey(getSigningKey())
                .build()
                .parseClaimsJws(token)
                .getBody()
                .getSubject();
    }

    // 2. Token geçerli mi diye kontrol etme
    public void validateToken(String token) {
        Jwts.parserBuilder()
                .setSigningKey(getSigningKey())
                .build()
                .parseClaimsJws(token);
        // Eğer token sahteyse veya süresi dolmuşsa burada hata fırlatır
    }
}