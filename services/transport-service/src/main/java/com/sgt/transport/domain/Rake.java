package com.sgt.transport.domain;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "rakes")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Rake {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true)
    private String rakeNumber; // e.g. "RAKE-SE-8821"

    @Column(nullable = false)
    private String originStation; // e.g. "TATA", "JSW-VIJAYANAGAR"

    @Column(nullable = false)
    private String destinationStation; // "SGT-MUMBAI-TERMINAL"

    @Column(nullable = false)
    private Integer totalWagons; // e.g. 45

    @Column(nullable = false)
    private Double totalTonnage; // e.g. 2850.5

    @Column(nullable = false)
    private String status; // "PLANNED", "EN_ROUTE", "ARRIVED", "UNLOADING", "COMPLETED"

    private LocalDateTime eta;
    private LocalDateTime actualArrival;
    private LocalDateTime unloadingCompleted;
}

