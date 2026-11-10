package com.sgt.transport.domain;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "weighbridge_records")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class WeighbridgeRecord {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true)
    private String slipNumber;

    @Column(nullable = false)
    private String vehicleNumber; // Truck or Wagon Number

    @Column(nullable = false)
    private String vehicleType; // "TRUCK", "WAGON"

    @Column(nullable = false)
    private Double grossWeightTons;

    @Column(nullable = false)
    private Double tareWeightTons;

    @Column(nullable = false)
    private Double netWeightTons;

    @Column(nullable = false)
    private String operatorId;

    @Column(nullable = false)
    private LocalDateTime timestamp;
}

