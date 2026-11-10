package com.sgt.yard.domain;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "container_movements")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ContainerMovement {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String containerNumber;

    @Column(nullable = false)
    private String sourceLocation; // e.g. "WAGON-781", "SLOT-A-04-02-01", "TRUCK-MH12"

    @Column(nullable = false)
    private String destinationLocation; // e.g. "SLOT-A-04-02-02", "WAGON-782"

    @Column(nullable = false)
    private String equipmentId; // "CRANE-01", "REACHSTACKER-03"

    @Column(nullable = false)
    private String operatorName;

    @Column(nullable = false)
    private String movementType; // "RAKE_TO_YARD", "YARD_TO_TRUCK", "INTERNAL_SHUFFLE"

    @Column(nullable = false)
    private LocalDateTime timestamp;
}

