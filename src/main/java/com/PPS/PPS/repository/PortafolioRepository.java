package com.PPS.PPS.repository;

import com.PPS.PPS.entity.Portafolio;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.UUID;

public interface PortafolioRepository extends JpaRepository<Portafolio, UUID> {
}
