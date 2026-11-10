package com.sgt.commercial.domain;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "tariff_contracts")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class TariffContract {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true)
    private String contractNumber; // "TC-TATA-2026"

    @Column(nullable = false)
    private String customerCode;

    @Column(nullable = false)
    private String customerName;

    @Column(nullable = false)
    private String commodity;

    @Column(nullable = false)
    private Double handlingRatePerTon; // e.g. 150.0

    @Column(nullable = false)
    private Double freeDetentionHours; // e.g. 8.0

    @Column(nullable = false)
    private Double demurrageRatePerHour; // e.g. 500.0

    @Column(nullable = false)
    private Double storageRatePerDay; // e.g. 75.0

    private LocalDateTime validFrom;
    private LocalDateTime validTo;
}

