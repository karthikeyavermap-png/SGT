package com.sgt.yard.service;

import com.sgt.yard.domain.ContainerMovement;
import com.sgt.yard.domain.YardBlock;
import com.sgt.yard.domain.YardSlot;
import com.sgt.yard.kafka.YardEventProducer;
import com.sgt.yard.repository.ContainerMovementRepository;
import com.sgt.yard.repository.EquipmentRepository;
import com.sgt.yard.repository.YardBlockRepository;
import com.sgt.yard.repository.YardSlotRepository;
import jakarta.annotation.PostConstruct;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.*;

@Service
public class YardService {
    private final YardBlockRepository blockRepository;
    private final YardSlotRepository slotRepository;
    private final ContainerMovementRepository movementRepository;
    private final EquipmentRepository equipmentRepository;
    private final YardEventProducer eventProducer;

    public YardService(
            YardBlockRepository blockRepository,
            YardSlotRepository slotRepository,
            ContainerMovementRepository movementRepository,
            EquipmentRepository equipmentRepository,
            YardEventProducer eventProducer) {
        this.blockRepository = blockRepository;
        this.slotRepository = slotRepository;
        this.movementRepository = movementRepository;
        this.equipmentRepository = equipmentRepository;
        this.eventProducer = eventProducer;
    }

    @PostConstruct
    public void initSampleData() {
        if (blockRepository.count() == 0) {
            YardBlock blockA = YardBlock.builder()
                    .blockCode("BLOCK-A")
                    .zone("IMPORT")
                    .totalCapacity(240)
                    .currentOccupancy(142)
                    .status("ACTIVE")
                    .build();

            YardBlock blockB = YardBlock.builder()
                    .blockCode("BLOCK-B")
                    .zone("EXPORT")
                    .totalCapacity(240)
                    .currentOccupancy(198)
                    .status("ACTIVE")
                    .build();

            YardBlock blockC = YardBlock.builder()
                    .blockCode("BLOCK-C")
                    .zone("EMPTY")
                    .totalCapacity(180)
                    .currentOccupancy(45)
                    .status("ACTIVE")
                    .build();

            blockRepository.saveAll(List.of(blockA, blockB, blockC));

            // Seed slots for Block A
            List<YardSlot> sampleSlots = new ArrayList<>();
            for (int bay = 1; bay <= 5; bay++) {
                for (int row = 1; row <= 4; row++) {
                    boolean isOccupied = (bay + row) % 2 == 0;
                    sampleSlots.add(YardSlot.builder()
                            .blockCode("BLOCK-A")
                            .bay(bay)
                            .rowNumber(row)
                            .tier(1)
                            .status(isOccupied ? "OCCUPIED" : "AVAILABLE")
                            .containerNumber(isOccupied ? "TGHU" + (100000 + bay * 10 + row) : null)
                            .weightTons(isOccupied ? 24.5 : null)
                            .commodity(isOccupied ? "Finished Steel Coils" : null)
                            .placedAt(isOccupied ? LocalDateTime.now().minusHours(bay * 3) : null)
                            .build());
                }
            }
            slotRepository.saveAll(sampleSlots);
        }
    }

    public List<YardBlock> getAllBlocks() {
        return blockRepository.findAll();
    }

    public List<YardSlot> getSlotsByBlock(String blockCode) {
        return slotRepository.findByBlockCode(blockCode);
    }

    @Transactional
    public YardSlot placeContainer(String blockCode, String containerNumber, Double weight, String commodity, String equipmentId, String operator) {
        YardSlot slot = slotRepository.findFirstByBlockCodeAndStatus(blockCode, "AVAILABLE")
                .orElseThrow(() -> new RuntimeException("No available slot in block: " + blockCode));

        slot.setStatus("OCCUPIED");
        slot.setContainerNumber(containerNumber);
        slot.setWeightTons(weight);
        slot.setCommodity(commodity);
        slot.setPlacedAt(LocalDateTime.now());
        YardSlot savedSlot = slotRepository.save(slot);

        // Update block occupancy
        blockRepository.findByBlockCode(blockCode).ifPresent(block -> {
            block.setCurrentOccupancy(block.getCurrentOccupancy() + 1);
            blockRepository.save(block);
        });

        // Record movement
        ContainerMovement movement = ContainerMovement.builder()
                .containerNumber(containerNumber)
                .sourceLocation("WAGON_INBOUND")
                .destinationLocation(String.format("%s-B%02d-R%02d-T%02d", blockCode, slot.getBay(), slot.getRowNumber(), slot.getTier()))
                .equipmentId(equipmentId != null ? equipmentId : "RMG-CRANE-01")
                .operatorName(operator != null ? operator : "Yard Specialist")
                .movementType("RAKE_TO_YARD")
                .timestamp(LocalDateTime.now())
                .build();
        movementRepository.save(movement);

        // Publish Event to Kafka
        Map<String, Object> eventData = new HashMap<>();
        eventData.put("containerNumber", containerNumber);
        eventData.put("blockCode", blockCode);
        eventData.put("bay", slot.getBay());
        eventData.put("row", slot.getRowNumber());
        eventData.put("weightTons", weight);
        eventData.put("commodity", commodity);
        eventProducer.publishEvent("CONTAINER_PLACED", eventData);

        return savedSlot;
    }

    public List<ContainerMovement> getMovements(String containerNumber) {
        return movementRepository.findByContainerNumberOrderByTimestampDesc(containerNumber);
    }
}

