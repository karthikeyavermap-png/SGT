package com.sgt.transport.domain;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "wagons")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Wagon {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String rakeNumber;

    @Column(nullable = false)
    private String wagonNumber; // e.g., "BOXNHL-22019"

    @Column(nullable = false)
    private String wagonType; // "BOXN", "BCN", "BTPN", "BLCA"

    @Column(nullable = false)
    private String commodity; // "Iron Ore", "Steel Coils", "Coal", "Fertilizer"

    @Column(nullable = false)
    private Double payloadTons;

    @Column(nullable = false)
    private String status; // "LOADED", "DISCHARGING", "EMPTY"
}

