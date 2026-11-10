package com.sgt.transport.service;

import com.sgt.transport.domain.Rake;
import com.sgt.transport.domain.TruckVisit;
import com.sgt.transport.domain.Wagon;
import com.sgt.transport.domain.WeighbridgeRecord;
import com.sgt.transport.kafka.TransportEventProducer;
import com.sgt.transport.repository.RakeRepository;
import com.sgt.transport.repository.TruckVisitRepository;
import com.sgt.transport.repository.WagonRepository;
import com.sgt.transport.repository.WeighbridgeRepository;
import jakarta.annotation.PostConstruct;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.*;

@Service
public class TransportService {
    private final RakeRepository rakeRepository;
    private final WagonRepository wagonRepository;
    private final TruckVisitRepository truckVisitRepository;
    private final WeighbridgeRepository weighbridgeRepository;
    private final TransportEventProducer eventProducer;

    public TransportService(
            RakeRepository rakeRepository,
            WagonRepository wagonRepository,
            TruckVisitRepository truckVisitRepository,
            WeighbridgeRepository weighbridgeRepository,
            TransportEventProducer eventProducer) {
        this.rakeRepository = rakeRepository;
        this.wagonRepository = wagonRepository;
        this.truckVisitRepository = truckVisitRepository;
        this.weighbridgeRepository = weighbridgeRepository;
        this.eventProducer = eventProducer;
    }

    @PostConstruct
    public void initSampleData() {
        if (rakeRepository.count() == 0) {
            Rake rake1 = Rake.builder()
                    .rakeNumber("RAKE-SE-9021")
                    .originStation("TATA-STEEL-JAMSHEDPUR")
                    .destinationStation("SGT-CENTRAL-TERMINAL")
                    .totalWagons(42)
                    .totalTonnage(2680.0)
                    .status("ARRIVED")
                    .eta(LocalDateTime.now().minusHours(2))
                    .actualArrival(LocalDateTime.now().minusHours(2))
                    .build();

            Rake rake2 = Rake.builder()
                    .rakeNumber("RAKE-WC-4108")
                    .originStation("JSW-BELLARY")
                    .destinationStation("SGT-CENTRAL-TERMINAL")
                    .totalWagons(58)
                    .totalTonnage(3750.0)
                    .status("EN_ROUTE")
                    .eta(LocalDateTime.now().plusHours(4))
                    .build();

            rakeRepository.saveAll(List.of(rake1, rake2));

            // Seed sample wagons
            List<Wagon> wagons = new ArrayList<>();
            for (int i = 1; i <= 6; i++) {
                wagons.add(Wagon.builder()
                        .rakeNumber("RAKE-SE-9021")
                        .wagonNumber("BOXNHL-1082" + i)
                        .wagonType("BOXNHL")
                        .commodity("HR Coils")
                        .payloadTons(64.2)
                        .status(i <= 2 ? "EMPTY" : "LOADED")
                        .build());
            }
            wagonRepository.saveAll(wagons);

            // Seed sample active truck
            TruckVisit truck = TruckVisit.builder()
                    .tokenNumber("TRK-2026-0081")
                    .truckNumber("MH-12-RN-9912")
                    .transporterName("LogiGlobal Express")
                    .driverName("Vikram Singh")
                    .driverPhone("+91 98210 11223")
                    .status("GATE_IN")
                    .gateInTime(LocalDateTime.now().minusMinutes(45))
                    .tareWeightTons(14.5)
                    .build();
            truckVisitRepository.save(truck);
        }
    }

    public List<Rake> getAllRakes() {
        return rakeRepository.findAll();
    }

    public List<Wagon> getWagonsByRake(String rakeNumber) {
        return wagonRepository.findByRakeNumber(rakeNumber);
    }

    @Transactional
    public Rake updateRakeStatus(String rakeNumber, String status) {
        Rake rake = rakeRepository.findByRakeNumber(rakeNumber)
                .orElseThrow(() -> new RuntimeException("Rake not found: " + rakeNumber));

        rake.setStatus(status);
        if ("ARRIVED".equalsIgnoreCase(status) && rake.getActualArrival() == null) {
            rake.setActualArrival(LocalDateTime.now());
        } else if ("COMPLETED".equalsIgnoreCase(status)) {
            rake.setUnloadingCompleted(LocalDateTime.now());
        }

        Rake saved = rakeRepository.save(rake);

        // Publish to Kafka
        Map<String, Object> data = new HashMap<>();
        data.put("rakeNumber", rakeNumber);
        data.put("status", status);
        data.put("totalTonnage", rake.getTotalTonnage());
        eventProducer.publishEvent("RAKE_STATUS_CHANGED", data);

        return saved;
    }

    @Transactional
    public TruckVisit processTruckGateIn(String truckNumber, String transporter, String driverName, Double tareWeight) {
        String token = "TRK-" + System.currentTimeMillis() % 1000000;
        TruckVisit visit = TruckVisit.builder()
                .tokenNumber(token)
                .truckNumber(truckNumber)
                .transporterName(transporter)
                .driverName(driverName)
                .status("GATE_IN")
                .gateInTime(LocalDateTime.now())
                .tareWeightTons(tareWeight != null ? tareWeight : 14.0)
                .build();

        TruckVisit saved = truckVisitRepository.save(visit);

        // Weighbridge slip
        WeighbridgeRecord slip = WeighbridgeRecord.builder()
                .slipNumber("WB-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase())
                .vehicleNumber(truckNumber)
                .vehicleType("TRUCK")
                .tareWeightTons(visit.getTareWeightTons())
                .grossWeightTons(0.0)
                .netWeightTons(0.0)
                .operatorId("WB-OP-01")
                .timestamp(LocalDateTime.now())
                .build();
        weighbridgeRepository.save(slip);

        Map<String, Object> data = new HashMap<>();
        data.put("tokenNumber", token);
        data.put("truckNumber", truckNumber);
        data.put("transporter", transporter);
        data.put("gateInTime", visit.getGateInTime().toString());
        eventProducer.publishEvent("TRUCK_GATE_IN", data);

        return saved;
    }

    @Transactional
    public TruckVisit processTruckGateOut(String tokenNumber, Double grossWeight) {
        TruckVisit visit = truckVisitRepository.findByTokenNumber(tokenNumber)
                .orElseThrow(() -> new RuntimeException("Truck token not found: " + tokenNumber));

        visit.setGrossWeightTons(grossWeight);
        visit.setNetWeightTons(grossWeight - visit.getTareWeightTons());
        visit.setGateOutTime(LocalDateTime.now());
        visit.setStatus("GATE_OUT");

        TruckVisit saved = truckVisitRepository.save(visit);

        Map<String, Object> data = new HashMap<>();
        data.put("tokenNumber", tokenNumber);
        data.put("truckNumber", visit.getTruckNumber());
        data.put("netWeightTons", visit.getNetWeightTons());
        data.put("gateOutTime", visit.getGateOutTime().toString());
        eventProducer.publishEvent("TRUCK_GATE_OUT", data);

        return saved;
    }

    public List<TruckVisit> getActiveTrucks() {
        return truckVisitRepository.findAll();
    }
}

