package com.sgt.transport.repository;

import com.sgt.transport.domain.Wagon;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface WagonRepository extends JpaRepository<Wagon, Long> {
    List<Wagon> findByRakeNumber(String rakeNumber);
}

