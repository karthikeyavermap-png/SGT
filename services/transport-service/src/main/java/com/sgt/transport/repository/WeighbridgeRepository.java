package com.sgt.transport.repository;

import com.sgt.transport.domain.WeighbridgeRecord;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;

public interface WeighbridgeRepository extends JpaRepository<WeighbridgeRecord, Long> {
    Optional<WeighbridgeRecord> findBySlipNumber(String slipNumber);
}

