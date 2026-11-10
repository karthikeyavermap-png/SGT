package com.sgt.commercial.controller;

import com.sgt.commercial.domain.CustomerOrder;
import com.sgt.commercial.domain.DemurrageRecord;
import com.sgt.commercial.domain.Invoice;
import com.sgt.commercial.domain.TariffContract;
import com.sgt.commercial.service.CommercialService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/commercial")
@CrossOrigin(origins = "*")
public class CommercialController {

    private final CommercialService commercialService;

    public CommercialController(CommercialService commercialService) {
        this.commercialService = commercialService;
    }

    @GetMapping("/health")
    public ResponseEntity<Map<String, Object>> health() {
        return ResponseEntity.ok(Map.of(
                "status", "UP",
                "service", "commercial-service",
                "version", "1.0.0",
                "timestamp", System.currentTimeMillis()
        ));
    }

    @GetMapping("/orders")
    public ResponseEntity<List<CustomerOrder>> getOrders() {
        return ResponseEntity.ok(commercialService.getAllOrders());
    }

    @PostMapping("/orders")
    public ResponseEntity<CustomerOrder> createOrder(@RequestBody CustomerOrder order) {
        return ResponseEntity.ok(commercialService.createOrder(order));
    }

    @GetMapping("/invoices")
    public ResponseEntity<List<Invoice>> getInvoices() {
        return ResponseEntity.ok(commercialService.getAllInvoices());
    }

    @PostMapping("/invoices/generate")
    public ResponseEntity<Invoice> generateInvoice(@RequestBody Map<String, Object> req) {
        String customerCode = (String) req.get("customerCode");
        Double handlingCharges = req.get("handlingCharges") != null ? Double.valueOf(req.get("handlingCharges").toString()) : 0.0;
        Double storageCharges = req.get("storageCharges") != null ? Double.valueOf(req.get("storageCharges").toString()) : 0.0;
        Double demurrageCharges = req.get("demurrageCharges") != null ? Double.valueOf(req.get("demurrageCharges").toString()) : 0.0;

        return ResponseEntity.ok(commercialService.generateInvoice(customerCode, handlingCharges, storageCharges, demurrageCharges));
    }

    @GetMapping("/tariffs")
    public ResponseEntity<List<TariffContract>> getTariffs() {
        return ResponseEntity.ok(commercialService.getAllTariffs());
    }

    @GetMapping("/demurrage")
    public ResponseEntity<List<DemurrageRecord>> getDemurrageRecords() {
        return ResponseEntity.ok(commercialService.getAllDemurrageRecords());
    }

    @PostMapping("/demurrage/calculate")
    public ResponseEntity<DemurrageRecord> calculateDemurrage(@RequestBody Map<String, Object> req) {
        String referenceId = (String) req.get("referenceId");
        String referenceType = (String) req.getOrDefault("referenceType", "RAKE");
        String customerCode = (String) req.get("customerCode");
        Double totalHoursHeld = Double.valueOf(req.getOrDefault("totalHoursHeld", 0.0).toString());

        return ResponseEntity.ok(commercialService.calculateDemurrage(referenceId, referenceType, customerCode, totalHoursHeld));
    }
}

