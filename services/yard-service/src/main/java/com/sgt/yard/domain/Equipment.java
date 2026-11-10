package com.sgt.yard.domain;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "equipment")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Equipment {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true)
    private String equipmentCode; // e.g. "RMG-CRANE-01"

    @Column(nullable = false)
    private String equipmentType; // "RAIL_MOUNTED_GANTRY", "REACH_STACKER", "FORKLIFT"

    @Column(nullable = false)
    private String status; // "OPERATIONAL", "BUSY", "MAINTENANCE"

    private String currentBlock; // "BLOCK-A"
    private String currentOperator;
}

