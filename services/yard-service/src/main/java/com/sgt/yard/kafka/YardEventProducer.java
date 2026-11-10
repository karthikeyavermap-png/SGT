package com.sgt.yard.kafka;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.stereotype.Component;
import java.util.Map;

@Component
public class YardEventProducer {
    private static final Logger log = LoggerFactory.getLogger(YardEventProducer.class);

    private final KafkaTemplate<String, Object> kafkaTemplate;
    private final String yardEventsTopic;

    public YardEventProducer(
            KafkaTemplate<String, Object> kafkaTemplate,
            @Value("${sgt.kafka.topics.yard-events:sgt.yard.events}") String yardEventsTopic) {
        this.kafkaTemplate = kafkaTemplate;
        this.yardEventsTopic = yardEventsTopic;
    }

    public void publishEvent(String eventType, Map<String, Object> payload) {
        try {
            payload.put("eventType", eventType);
            payload.put("service", "yard-service");
            payload.put("timestamp", System.currentTimeMillis());
            kafkaTemplate.send(yardEventsTopic, eventType, payload);
            log.info("Published {} event to topic {}", eventType, yardEventsTopic);
        } catch (Exception e) {
            log.warn("Kafka event dispatch failed (broker may be in mock/standalone mode): {}", e.getMessage());
        }
    }
}

