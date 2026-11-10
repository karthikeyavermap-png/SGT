package com.sgt.commercial.repository;

import com.sgt.commercial.domain.CustomerOrder;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface CustomerOrderRepository extends JpaRepository<CustomerOrder, Long> {
    Optional<CustomerOrder> findByOrderNumber(String orderNumber);
    List<CustomerOrder> findByCustomerCode(String customerCode);
    List<CustomerOrder> findByStatus(String status);
}

