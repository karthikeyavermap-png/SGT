package com.sgt.commercial.kafka;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.stereotype.Component;

import java.util.Map;

@Component
public class CommercialEventProducer {
    private static final Logger log = LoggerFactory.getLogger(CommercialEventProducer.class);

    private final KafkaTemplate<String, Object> kafkaTemplate;
    private final String commercialEventsTopic;

    public CommercialEventProducer(
            KafkaTemplate<String, Object> kafkaTemplate,
            @Value("${sgt.kafka.topics.commercial-events:sgt.commercial.events}") String commercialEventsTopic) {
        this.kafkaTemplate = kafkaTemplate;
        this.commercialEventsTopic = commercialEventsTopic;
    }

    public void publishEvent(String eventType, Map<String, Object> payload) {
        try {
            payload.put("eventType", eventType);
            payload.put("service", "commercial-service");
            payload.put("timestamp", System.currentTimeMillis());
            kafkaTemplate.send(commercialEventsTopic, eventType, payload);
            log.info("Published commercial event {} to topic {}", eventType, commercialEventsTopic);
        } catch (Exception e) {
            log.warn("Kafka event dispatch failed (broker may be in mock/standalone mode): {}", e.getMessage());
        }
    }
}

