package com.sgt.transport.domain;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "truck_visits")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class TruckVisit {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true)
    private String tokenNumber; // "TRK-2026-00421"

    @Column(nullable = false)
    private String truckNumber; // "MH-12-RN-8822"

    @Column(nullable = false)
    private String transporterName;

    @Column(nullable = false)
    private String driverName;

    private String driverPhone;

    @Column(nullable = false)
    private String status; // "GATE_IN", "WEIGHED_TARE", "LOADING", "WEIGHED_GROSS", "GATE_OUT"

    private LocalDateTime gateInTime;
    private LocalDateTime gateOutTime;
    private Double tareWeightTons;
    private Double grossWeightTons;
    private Double netWeightTons;
}

