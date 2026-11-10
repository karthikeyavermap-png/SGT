package com.sgt.commercial.domain;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "customer_orders")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CustomerOrder {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true)
    private String orderNumber; // "ORD-2026-901"

    @Column(nullable = false)
    private String customerName; // "Tata Steel Ltd."

    @Column(nullable = false)
    private String customerCode; // "CUST-TATA"

    @Column(nullable = false)
    private String commodity; // "Cold Rolled Steel"

    @Column(nullable = false)
    private Double quantityTons;

    @Column(nullable = false)
    private Double ratePerTon;

    @Column(nullable = false)
    private Double totalContractValue;

    @Column(nullable = false)
    private String status; // "CONFIRMED", "PROCESSING", "DISPATCHED", "BILLED"

    private LocalDateTime orderDate;
}

