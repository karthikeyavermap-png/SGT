package com.sgt.yard.domain;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "yard_slots")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class YardSlot {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String blockCode; // "BLOCK-A"

    @Column(nullable = false)
    private Integer bay; // Bay coordinate (1..20)

    @Column(nullable = false)
    private Integer rowNumber; // Row coordinate (1..6)

    @Column(nullable = false)
    private Integer tier; // Tier / Stacking level (1..4)

    @Column(nullable = false)
    private String status; // "AVAILABLE", "OCCUPIED", "RESERVED"

    private String containerNumber; // e.g., "MSKU9281726"
    private Double weightTons;
    private String commodity;
    private LocalDateTime placedAt;
}

