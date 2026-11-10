package com.sgt.yard.domain;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "yard_blocks")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class YardBlock {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true)
    private String blockCode; // e.g., "BLOCK-A", "BLOCK-B"

    @Column(nullable = false)
    private String zone; // "IMPORT", "EXPORT", "EMPTY", "REEFER"

    @Column(nullable = false)
    private Integer totalCapacity; // Total TEU capacity

    @Column(nullable = false)
    private Integer currentOccupancy; // Currently occupied slots

    @Column(nullable = false)
    private String status; // "ACTIVE", "MAINTENANCE", "FULL"
}

