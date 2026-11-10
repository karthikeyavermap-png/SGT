package com.sgt.yard.controller;

import com.sgt.yard.domain.ContainerMovement;
import com.sgt.yard.domain.YardBlock;
import com.sgt.yard.domain.YardSlot;
import com.sgt.yard.service.YardService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/yard")
@CrossOrigin(origins = "*")
public class YardController {
    private final YardService yardService;

    public YardController(YardService yardService) {
        this.yardService = yardService;
    }

    @GetMapping("/blocks")
    public ResponseEntity<List<YardBlock>> getBlocks() {
        return ResponseEntity.ok(yardService.getAllBlocks());
    }

    @GetMapping("/slots")
    public ResponseEntity<List<YardSlot>> getSlots(@RequestParam(defaultValue = "BLOCK-A") String blockCode) {
        return ResponseEntity.ok(yardService.getSlotsByBlock(blockCode));
    }

    @PostMapping("/containers/assign-slot")
    public ResponseEntity<YardSlot> assignSlot(@RequestBody Map<String, Object> body) {
        String blockCode = (String) body.getOrDefault("blockCode", "BLOCK-A");
        String containerNumber = (String) body.get("containerNumber");
        Double weight = body.get("weightTons") != null ? Double.valueOf(body.get("weightTons").toString()) : 25.0;
        String commodity = (String) body.getOrDefault("commodity", "General Cargo");
        String equipmentId = (String) body.getOrDefault("equipmentId", "RMG-01");
        String operator = (String) body.getOrDefault("operator", "Staff");

        YardSlot slot = yardService.placeContainer(blockCode, containerNumber, weight, commodity, equipmentId, operator);
        return ResponseEntity.ok(slot);
    }

    @GetMapping("/movements")
    public ResponseEntity<List<ContainerMovement>> getMovements(@RequestParam String containerNumber) {
        return ResponseEntity.ok(yardService.getMovements(containerNumber));
    }

    @GetMapping("/health")
    public ResponseEntity<Map<String, Object>> health() {
        return ResponseEntity.ok(Map.of(
                "service", "yard-service",
                "status", "UP",
                "timestamp", System.currentTimeMillis()
        ));
    }
}

