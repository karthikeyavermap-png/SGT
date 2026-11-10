package com.sgt.transport.repository;

import com.sgt.transport.domain.Rake;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;

public interface RakeRepository extends JpaRepository<Rake, Long> {
    Optional<Rake> findByRakeNumber(String rakeNumber);
}

