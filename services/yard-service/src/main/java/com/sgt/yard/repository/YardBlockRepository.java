package com.sgt.yard.repository;

import com.sgt.yard.domain.YardBlock;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;

public interface YardBlockRepository extends JpaRepository<YardBlock, Long> {
    Optional<YardBlock> findByBlockCode(String blockCode);
}

