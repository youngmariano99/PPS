package com.PPS.PPS.repository;

import com.PPS.PPS.entity.Rubro;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface RubroRepository extends JpaRepository<Rubro, UUID> {
    List<Rubro> findByActivaTrue();
}
