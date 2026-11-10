package com.sgt.yard.repository;

import com.sgt.yard.domain.YardSlot;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.Optional;

public interface YardSlotRepository extends JpaRepository<YardSlot, Long> {
    List<YardSlot> findByBlockCode(String blockCode);
    List<YardSlot> findByBlockCodeAndBay(String blockCode, Integer bay);
    Optional<YardSlot> findByContainerNumber(String containerNumber);
    Optional<YardSlot> findFirstByBlockCodeAndStatus(String blockCode, String status);
}

