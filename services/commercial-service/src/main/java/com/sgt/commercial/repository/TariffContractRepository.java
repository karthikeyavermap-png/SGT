package com.sgt.commercial.repository;

import com.sgt.commercial.domain.TariffContract;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface TariffContractRepository extends JpaRepository<TariffContract, Long> {
    Optional<TariffContract> findByCustomerCode(String customerCode);
    Optional<TariffContract> findByContractNumber(String contractNumber);
}

