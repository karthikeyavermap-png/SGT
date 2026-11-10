package com.sgt.commercial.domain;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "invoices")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Invoice {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true)
    private String invoiceNumber; // "INV-SGT-2026-0042"

    @Column(nullable = false)
    private String customerName;

    @Column(nullable = false)
    private String customerCode;

    @Column(nullable = false)
    private Double handlingCharges;

    @Column(nullable = false)
    private Double storageCharges;

    @Column(nullable = false)
    private Double demurrageCharges;

    @Column(nullable = false)
    private Double taxAmount; // 18% GST

    @Column(nullable = false)
    private Double totalAmount;

    @Column(nullable = false)
    private String status; // "PENDING", "PAID", "OVERDUE"

    private LocalDateTime issueDate;
    private LocalDateTime dueDate;
}

