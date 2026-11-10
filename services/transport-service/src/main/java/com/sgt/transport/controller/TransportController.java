package com.sgt.transport.controller;

import com.sgt.transport.domain.Rake;
import com.sgt.transport.domain.TruckVisit;
import com.sgt.transport.domain.Wagon;
import com.sgt.transport.service.TransportService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/transport")
@CrossOrigin(origins = "*")
public class TransportController {
    private final TransportService transportService;

    public TransportController(TransportService transportService) {
        this.transportService = transportService;
    }

    @GetMapping("/rakes")
    public ResponseEntity<List<Rake>> getRakes() {
        return ResponseEntity.ok(transportService.getAllRakes());
    }

    @GetMapping("/rakes/{rakeNumber}/wagons")
    public ResponseEntity<List<Wagon>> getWagons(@PathVariable String rakeNumber) {
        return ResponseEntity.ok(transportService.getWagonsByRake(rakeNumber));
    }

    @PatchMapping("/rakes/{rakeNumber}/status")
    public ResponseEntity<Rake> updateRakeStatus(@PathVariable String rakeNumber, @RequestBody Map<String, String> body) {
        String status = body.get("status");
        return ResponseEntity.ok(transportService.updateRakeStatus(rakeNumber, status));
    }

    @PostMapping("/trucks/gate-in")
    public ResponseEntity<TruckVisit> truckGateIn(@RequestBody Map<String, Object> body) {
        String truckNumber = (String) body.get("truckNumber");
        String transporter = (String) body.getOrDefault("transporter", "Direct Shipper");
        String driverName = (String) body.getOrDefault("driverName", "Driver");
        Double tareWeight = body.get("tareWeightTons") != null ? Double.valueOf(body.get("tareWeightTons").toString()) : 14.0;

        return ResponseEntity.ok(transportService.processTruckGateIn(truckNumber, transporter, driverName, tareWeight));
    }

    @PostMapping("/trucks/gate-out")
    public ResponseEntity<TruckVisit> truckGateOut(@RequestBody Map<String, Object> body) {
        String tokenNumber = (String) body.get("tokenNumber");
        Double grossWeight = Double.valueOf(body.get("grossWeightTons").toString());

        return ResponseEntity.ok(transportService.processTruckGateOut(tokenNumber, grossWeight));
    }

    @GetMapping("/trucks")
    public ResponseEntity<List<TruckVisit>> getActiveTrucks() {
        return ResponseEntity.ok(transportService.getActiveTrucks());
    }

    @GetMapping("/health")
    public ResponseEntity<Map<String, Object>> health() {
        return ResponseEntity.ok(Map.of(
                "service", "transport-service",
                "status", "UP",
                "timestamp", System.currentTimeMillis()
        ));
    }
}

