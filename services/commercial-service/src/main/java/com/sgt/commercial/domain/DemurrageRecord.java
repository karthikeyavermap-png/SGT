package com.sgt.commercial.domain;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "demurrage_records")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class DemurrageRecord {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String referenceId; // e.g. Rake Number "RK-2026-ER-01" or Truck "MH-12-QZ-4921"

    @Column(nullable = false)
    private String referenceType; // "RAKE", "TRUCK", "CONTAINER"

    @Column(nullable = false)
    private String customerCode;

    private Double freeHoursAllowed;

    private Double totalHoursHeld;

    private Double billableDemurrageHours;

    private Double hourlyRate;

    private Double totalDemurrageAmount;

    @Column(nullable = false)
    private String status; // "ACCRUING", "INVOICED", "WAIVED"

    private LocalDateTime recordedAt;
}

