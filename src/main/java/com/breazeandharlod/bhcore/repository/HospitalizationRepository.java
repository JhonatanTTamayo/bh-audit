package com.breazeandharlod.bhcore.repository;

import com.breazeandharlod.bhcore.entity.Hospitalization;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface HospitalizationRepository extends JpaRepository<Hospitalization, String> {

    @Query("SELECT h FROM Hospitalization h WHERE h.pet.id = :petId AND h.status = 'ACTIVE'")
    Optional<Hospitalization> findActiveByPetId(@Param("petId") String petId);

    @Query("SELECT h FROM Hospitalization h WHERE h.pet.id = :petId ORDER BY h.admissionDate DESC")
    Page<Hospitalization> findByPetId(@Param("petId") String petId, Pageable pageable);

    @Query("SELECT h FROM Hospitalization h WHERE h.status = 'ACTIVE' ORDER BY h.admissionDate ASC")
    List<Hospitalization> findAllActive();

    @Query("SELECT h FROM Hospitalization h WHERE h.veterinarian.id = :veterinarianId AND h.status = 'ACTIVE'")
    List<Hospitalization> findActiveByVeterinarianId(@Param("veterinarianId") String veterinarianId);
}