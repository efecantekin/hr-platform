package com.hr.leave.config;

import org.springframework.amqp.core.TopicExchange;
import org.springframework.amqp.rabbit.connection.ConnectionFactory;
import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.amqp.support.converter.Jackson2JsonMessageConverter;
import org.springframework.amqp.support.converter.MessageConverter;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class RabbitMQConfig {

    // Exchange adı (Mesajın bırakıldığı ana merkez)
    public static final String EXCHANGE_NAME = "hr-exchange";
    
    // Routing Key (Mesajın kime gideceğini belirleyen etiket)
    // "notification.leave.created" -> Notification servisi bu etiketi dinleyecek
    public static final String ROUTING_KEY = "notification.leave.created";

    // 1. Exchange Oluştur
    @Bean
    public TopicExchange exchange() {
        return new TopicExchange(EXCHANGE_NAME);
    }

    // 2. JSON Dönüştürücü (Mesajlar binary değil, okunabilir JSON olarak gitsin)
    @Bean
    public MessageConverter converter() {
        return new Jackson2JsonMessageConverter();
    }

    // 3. RabbitTemplate (Mesajı fırlatan araç)
    @Bean
    public RabbitTemplate amqpTemplate(ConnectionFactory connectionFactory) {
        RabbitTemplate rabbitTemplate = new RabbitTemplate(connectionFactory);
        rabbitTemplate.setMessageConverter(converter());
        return rabbitTemplate;
    }
}