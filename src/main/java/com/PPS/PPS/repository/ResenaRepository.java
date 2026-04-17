package com.PPS.PPS.repository;

import com.PPS.PPS.entity.Resena;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.UUID;

@Repository
public interface ResenaRepository extends JpaRepository<Resena, UUID> {
}
