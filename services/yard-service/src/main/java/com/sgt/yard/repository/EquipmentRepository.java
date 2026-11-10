package com.sgt.yard.repository;

import com.sgt.yard.domain.Equipment;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;

public interface EquipmentRepository extends JpaRepository<Equipment, Long> {
    Optional<Equipment> findByEquipmentCode(String equipmentCode);
}

