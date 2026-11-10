package com.sgt.commercial.repository;

import com.sgt.commercial.domain.DemurrageRecord;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface DemurrageRepository extends JpaRepository<DemurrageRecord, Long> {
    List<DemurrageRecord> findByCustomerCode(String customerCode);
    List<DemurrageRecord> findByStatus(String status);
    List<DemurrageRecord> findByReferenceId(String referenceId);
}

