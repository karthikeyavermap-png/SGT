package com.sgt.commercial.service;

import com.sgt.commercial.domain.CustomerOrder;
import com.sgt.commercial.domain.DemurrageRecord;
import com.sgt.commercial.domain.Invoice;
import com.sgt.commercial.domain.TariffContract;
import com.sgt.commercial.kafka.CommercialEventProducer;
import com.sgt.commercial.repository.CustomerOrderRepository;
import com.sgt.commercial.repository.DemurrageRepository;
import com.sgt.commercial.repository.InvoiceRepository;
import com.sgt.commercial.repository.TariffContractRepository;
import jakarta.annotation.PostConstruct;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.*;

@Service
public class CommercialService {
    private static final Logger log = LoggerFactory.getLogger(CommercialService.class);

    private final CustomerOrderRepository orderRepository;
    private final InvoiceRepository invoiceRepository;
    private final TariffContractRepository tariffRepository;
    private final DemurrageRepository demurrageRepository;
    private final CommercialEventProducer eventProducer;

    public CommercialService(
            CustomerOrderRepository orderRepository,
            InvoiceRepository invoiceRepository,
            TariffContractRepository tariffRepository,
            DemurrageRepository demurrageRepository,
            CommercialEventProducer eventProducer) {
        this.orderRepository = orderRepository;
        this.invoiceRepository = invoiceRepository;
        this.tariffRepository = tariffRepository;
        this.demurrageRepository = demurrageRepository;
        this.eventProducer = eventProducer;
    }

    @PostConstruct
    public void seedInitialData() {
        if (tariffRepository.count() == 0) {
            log.info("Seeding Commercial tariff contracts, orders, and invoices...");

            TariffContract tc1 = TariffContract.builder()
                    .contractNumber("TC-TATA-2026")
                    .customerCode("CUST-TATA")
                    .customerName("Tata Steel Ltd.")
                    .commodity("Cold Rolled Steel")
                    .handlingRatePerTon(180.0)
                    .freeDetentionHours(8.0)
                    .demurrageRatePerHour(750.0)
                    .storageRatePerDay(95.0)
                    .validFrom(LocalDateTime.now().minusMonths(6))
                    .validTo(LocalDateTime.now().plusMonths(6))
                    .build();

            TariffContract tc2 = TariffContract.builder()
                    .contractNumber("TC-JSW-2026")
                    .customerCode("CUST-JSW")
                    .customerName("JSW Infrastructure")
                    .commodity("Iron Ore Pellets")
                    .handlingRatePerTon(140.0)
                    .freeDetentionHours(6.0)
                    .demurrageRatePerHour(600.0)
                    .storageRatePerDay(70.0)
                    .validFrom(LocalDateTime.now().minusMonths(3))
                    .validTo(LocalDateTime.now().plusMonths(9))
                    .build();

            TariffContract tc3 = TariffContract.builder()
                    .contractNumber("TC-ULTRATECH-2026")
                    .customerCode("CUST-ULTRA")
                    .customerName("UltraTech Cement Ltd.")
                    .commodity("Dry Flyash & Clinker")
                    .handlingRatePerTon(125.0)
                    .freeDetentionHours(9.0)
                    .demurrageRatePerHour(500.0)
                    .storageRatePerDay(60.0)
                    .validFrom(LocalDateTime.now().minusMonths(2))
                    .validTo(LocalDateTime.now().plusMonths(10))
                    .build();

            tariffRepository.saveAll(List.of(tc1, tc2, tc3));

            CustomerOrder ord1 = CustomerOrder.builder()
                    .orderNumber("ORD-2026-901")
                    .customerName("Tata Steel Ltd.")
                    .customerCode("CUST-TATA")
                    .commodity("Cold Rolled Steel")
                    .quantityTons(3500.0)
                    .ratePerTon(180.0)
                    .totalContractValue(630000.0)
                    .status("PROCESSING")
                    .orderDate(LocalDateTime.now().minusDays(2))
                    .build();

            CustomerOrder ord2 = CustomerOrder.builder()
                    .orderNumber("ORD-2026-902")
                    .customerName("JSW Infrastructure")
                    .customerCode("CUST-JSW")
                    .commodity("Iron Ore Pellets")
                    .quantityTons(4200.0)
                    .ratePerTon(140.0)
                    .totalContractValue(588000.0)
                    .status("CONFIRMED")
                    .orderDate(LocalDateTime.now().minusDays(1))
                    .build();

            CustomerOrder ord3 = CustomerOrder.builder()
                    .orderNumber("ORD-2026-899")
                    .customerName("UltraTech Cement Ltd.")
                    .customerCode("CUST-ULTRA")
                    .commodity("Dry Flyash & Clinker")
                    .quantityTons(2800.0)
                    .ratePerTon(125.0)
                    .totalContractValue(350000.0)
                    .status("BILLED")
                    .orderDate(LocalDateTime.now().minusDays(5))
                    .build();

            orderRepository.saveAll(List.of(ord1, ord2, ord3));

            Invoice inv1 = Invoice.builder()
                    .invoiceNumber("INV-SGT-2026-0042")
                    .customerName("UltraTech Cement Ltd.")
                    .customerCode("CUST-ULTRA")
                    .handlingCharges(350000.0)
                    .storageCharges(24000.0)
                    .demurrageCharges(4500.0)
                    .taxAmount(68130.0) // 18% of (350000 + 24000 + 4500)
                    .totalAmount(446630.0)
                    .status("PAID")
                    .issueDate(LocalDateTime.now().minusDays(3))
                    .dueDate(LocalDateTime.now().plusDays(27))
                    .build();

            Invoice inv2 = Invoice.builder()
                    .invoiceNumber("INV-SGT-2026-0043")
                    .customerName("Tata Steel Ltd.")
                    .customerCode("CUST-TATA")
                    .handlingCharges(630000.0)
                    .storageCharges(45000.0)
                    .demurrageCharges(6750.0)
                    .taxAmount(122715.0)
                    .totalAmount(804465.0)
                    .status("PENDING")
                    .issueDate(LocalDateTime.now().minusDays(1))
                    .dueDate(LocalDateTime.now().plusDays(29))
                    .build();

            invoiceRepository.saveAll(List.of(inv1, inv2));

            DemurrageRecord dem1 = DemurrageRecord.builder()
                    .referenceId("RK-2026-ER-01")
                    .referenceType("RAKE")
                    .customerCode("CUST-TATA")
                    .freeHoursAllowed(8.0)
                    .totalHoursHeld(17.0)
                    .billableDemurrageHours(9.0)
                    .hourlyRate(750.0)
                    .totalDemurrageAmount(6750.0)
                    .status("INVOICED")
                    .recordedAt(LocalDateTime.now().minusHours(18))
                    .build();

            DemurrageRecord dem2 = DemurrageRecord.builder()
                    .referenceId("TRK-MH12-4921")
                    .referenceType("TRUCK")
                    .customerCode("CUST-JSW")
                    .freeHoursAllowed(6.0)
                    .totalHoursHeld(9.5)
                    .billableDemurrageHours(3.5)
                    .hourlyRate(600.0)
                    .totalDemurrageAmount(2100.0)
                    .status("ACCRUING")
                    .recordedAt(LocalDateTime.now().minusHours(4))
                    .build();

            demurrageRepository.saveAll(List.of(dem1, dem2));
        }
    }

    public List<CustomerOrder> getAllOrders() {
        return orderRepository.findAll();
    }

    public CustomerOrder createOrder(CustomerOrder order) {
        if (order.getOrderNumber() == null || order.getOrderNumber().isBlank()) {
            order.setOrderNumber("ORD-2026-" + (1000 + (int)(Math.random() * 9000)));
        }
        if (order.getOrderDate() == null) {
            order.setOrderDate(LocalDateTime.now());
        }
        if (order.getStatus() == null) {
            order.setStatus("CONFIRMED");
        }
        if (order.getTotalContractValue() == null && order.getQuantityTons() != null && order.getRatePerTon() != null) {
            order.setTotalContractValue(order.getQuantityTons() * order.getRatePerTon());
        }

        CustomerOrder saved = orderRepository.save(order);

        Map<String, Object> payload = new HashMap<>();
        payload.put("orderNumber", saved.getOrderNumber());
        payload.put("customerCode", saved.getCustomerCode());
        payload.put("commodity", saved.getCommodity());
        payload.put("quantityTons", saved.getQuantityTons());
        payload.put("totalValue", saved.getTotalContractValue());
        eventProducer.publishEvent("ORDER_CREATED", payload);

        return saved;
    }

    public List<Invoice> getAllInvoices() {
        return invoiceRepository.findAll();
    }

    @Transactional
    public Invoice generateInvoice(String customerCode, Double handlingCharges, Double storageCharges, Double demurrageCharges) {
        handlingCharges = handlingCharges != null ? handlingCharges : 0.0;
        storageCharges = storageCharges != null ? storageCharges : 0.0;
        demurrageCharges = demurrageCharges != null ? demurrageCharges : 0.0;

        double subtotal = handlingCharges + storageCharges + demurrageCharges;
        double tax = subtotal * 0.18; // 18% GST
        double total = subtotal + tax;

        String customerName = tariffRepository.findByCustomerCode(customerCode)
                .map(TariffContract::getCustomerName)
                .orElse(customerCode);

        String invNum = "INV-SGT-2026-" + String.format("%04d", (int)(Math.random() * 9000 + 1000));

        Invoice inv = Invoice.builder()
                .invoiceNumber(invNum)
                .customerName(customerName)
                .customerCode(customerCode)
                .handlingCharges(handlingCharges)
                .storageCharges(storageCharges)
                .demurrageCharges(demurrageCharges)
                .taxAmount(tax)
                .totalAmount(total)
                .status("PENDING")
                .issueDate(LocalDateTime.now())
                .dueDate(LocalDateTime.now().plusDays(30))
                .build();

        Invoice saved = invoiceRepository.save(inv);

        Map<String, Object> payload = new HashMap<>();
        payload.put("invoiceNumber", saved.getInvoiceNumber());
        payload.put("customerCode", saved.getCustomerCode());
        payload.put("totalAmount", saved.getTotalAmount());
        payload.put("demurrageAmount", saved.getDemurrageCharges());
        eventProducer.publishEvent("INVOICE_GENERATED", payload);

        return saved;
    }

    public List<TariffContract> getAllTariffs() {
        return tariffRepository.findAll();
    }

    public List<DemurrageRecord> getAllDemurrageRecords() {
        return demurrageRepository.findAll();
    }

    @Transactional
    public DemurrageRecord calculateDemurrage(String referenceId, String referenceType, String customerCode, Double totalHoursHeld) {
        TariffContract tc = tariffRepository.findByCustomerCode(customerCode).orElse(null);
        double freeHours = tc != null ? tc.getFreeDetentionHours() : 6.0;
        double hourlyRate = tc != null ? tc.getDemurrageRatePerHour() : 500.0;

        double billableHours = Math.max(0.0, totalHoursHeld - freeHours);
        double totalAmount = billableHours * hourlyRate;

        DemurrageRecord record = DemurrageRecord.builder()
                .referenceId(referenceId)
                .referenceType(referenceType)
                .customerCode(customerCode)
                .freeHoursAllowed(freeHours)
                .totalHoursHeld(totalHoursHeld)
                .billableDemurrageHours(billableHours)
                .hourlyRate(hourlyRate)
                .totalDemurrageAmount(totalAmount)
                .status(billableHours > 0 ? "ACCRUING" : "WAIVED")
                .recordedAt(LocalDateTime.now())
                .build();

        DemurrageRecord saved = demurrageRepository.save(record);

        if (totalAmount > 0) {
            Map<String, Object> payload = new HashMap<>();
            payload.put("referenceId", saved.getReferenceId());
            payload.put("referenceType", saved.getReferenceType());
            payload.put("customerCode", saved.getCustomerCode());
            payload.put("billableHours", saved.getBillableDemurrageHours());
            payload.put("demurrageAmount", saved.getTotalDemurrageAmount());
            eventProducer.publishEvent("DEMURRAGE_ACCRUED", payload);
        }

        return saved;
    }
}

