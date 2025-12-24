package com.hr.notification.config;

import com.hr.notification.event.LeaveCreatedEvent;
import com.hr.notification.event.EmployeeAssignedEvent;
import org.springframework.amqp.core.Binding;
import org.springframework.amqp.core.BindingBuilder;
import org.springframework.amqp.core.Queue;
import org.springframework.amqp.core.TopicExchange;
import org.springframework.amqp.support.converter.DefaultJackson2JavaTypeMapper;
import org.springframework.amqp.support.converter.Jackson2JsonMessageConverter;
import org.springframework.amqp.support.converter.MessageConverter;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import java.util.HashMap;
import java.util.Map;

@Configuration
public class RabbitMQConfig {

    public static final String QUEUE_NAME = "notification-queue";
    public static final String EXCHANGE_NAME = "hr-exchange";
    public static final String ROUTING_KEY = "notification.#";

    @Bean
    public Queue queue() {
        return new Queue(QUEUE_NAME, true);
    }

    @Bean
    public TopicExchange exchange() {
        return new TopicExchange(EXCHANGE_NAME);
    }

    @Bean
    public Binding binding(Queue queue, TopicExchange exchange) {
        return BindingBuilder.bind(queue).to(exchange).with(ROUTING_KEY);
    }

    /**
     * HATA ÇÖZÜMÜ: Mesaj Dönüştürücü ve Tip Eşleyici
     * Bu yapı, dışarıdan gelen farklı paket isimlerindeki eventleri 
     * kendi içimizdeki event sınıflarına zorla eşler.
     */
    @Bean
    public MessageConverter converter() {
        Jackson2JsonMessageConverter converter = new Jackson2JsonMessageConverter();
        
        DefaultJackson2JavaTypeMapper typeMapper = new DefaultJackson2JavaTypeMapper();
        // Güvenlik için tüm paketlere güven (veya "*" kullan)
        typeMapper.setTrustedPackages("*");
        
        // Gönderen tarafın paket ismi -> Bizim paket ismimiz eşlemesi
        Map<String, Class<?>> idClassMapping = new HashMap<>();
        
        // Leave Service'den gelenler için
        idClassMapping.put("com.hr.leave.event.LeaveCreatedEvent", LeaveCreatedEvent.class);
        
        // Employee Service'den gelenler için
        idClassMapping.put("com.hr.employee.event.EmployeeAssignedEvent", EmployeeAssignedEvent.class);
        
        typeMapper.setIdClassMapping(idClassMapping);
        converter.setJavaTypeMapper(typeMapper);
        
        return converter;
    }
}