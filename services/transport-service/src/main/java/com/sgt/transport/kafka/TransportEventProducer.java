package com.sgt.transport.kafka;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.stereotype.Component;
import java.util.Map;

@Component
public class TransportEventProducer {
    private static final Logger log = LoggerFactory.getLogger(TransportEventProducer.class);

    private final KafkaTemplate<String, Object> kafkaTemplate;
    private final String transportEventsTopic;

    public TransportEventProducer(
            KafkaTemplate<String, Object> kafkaTemplate,
            @Value("${sgt.kafka.topics.transport-events:sgt.transport.events}") String transportEventsTopic) {
        this.kafkaTemplate = kafkaTemplate;
        this.transportEventsTopic = transportEventsTopic;
    }

    public void publishEvent(String eventType, Map<String, Object> payload) {
        try {
            payload.put("eventType", eventType);
            payload.put("service", "transport-service");
            payload.put("timestamp", System.currentTimeMillis());
            kafkaTemplate.send(transportEventsTopic, eventType, payload);
            log.info("Published {} event to topic {}", eventType, transportEventsTopic);
        } catch (Exception e) {
            log.warn("Kafka event dispatch failed (broker may be in mock/standalone mode): {}", e.getMessage());
        }
    }
}

