package com.sgt.yard.repository;

import com.sgt.yard.domain.ContainerMovement;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface ContainerMovementRepository extends JpaRepository<ContainerMovement, Long> {
    List<ContainerMovement> findByContainerNumberOrderByTimestampDesc(String containerNumber);
}

