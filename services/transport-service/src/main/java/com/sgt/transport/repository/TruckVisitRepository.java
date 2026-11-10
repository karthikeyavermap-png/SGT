package com.sgt.transport.repository;

import com.sgt.transport.domain.TruckVisit;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;

public interface TruckVisitRepository extends JpaRepository<TruckVisit, Long> {
    Optional<TruckVisit> findByTokenNumber(String tokenNumber);
    Optional<TruckVisit> findByTruckNumberAndStatusNot(String truckNumber, String status);
}

