package com.PPS.PPS.domain.repository;

import com.PPS.PPS.domain.model.PlanSuscripcion;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

@Repository
public interface PlanSuscripcionRepository extends JpaRepository<PlanSuscripcion, UUID> {
    Optional<PlanSuscripcion> findByNombreIgnoreCase(String nombre);
}
