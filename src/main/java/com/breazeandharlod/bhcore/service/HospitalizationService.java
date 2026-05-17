package com.breazeandharlod.bhcore.service;

import com.breazeandharlod.bhcore.dto.request.HospitalizationRequest;
import com.breazeandharlod.bhcore.dto.response.HospitalizationResponse;
import com.breazeandharlod.bhcore.entity.Hospitalization;
import com.breazeandharlod.bhcore.entity.Pet;
import com.breazeandharlod.bhcore.entity.User;
import com.breazeandharlod.bhcore.exception.ResourceNotFoundException;
import com.breazeandharlod.bhcore.exception.InvalidOperationException;
import com.breazeandharlod.bhcore.repository.HospitalizationRepository;
import com.breazeandharlod.bhcore.repository.PetRepository;
import com.breazeandharlod.bhcore.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
@Transactional
public class HospitalizationService {

    private final HospitalizationRepository hospitalizationRepository;
    private final PetRepository petRepository;
    private final UserRepository userRepository;
    private final AuditService auditService;
    private final PetService petService;

    public HospitalizationResponse admitPet(HospitalizationRequest request, String userId) {
        log.info("Iniciando internamiento de mascota. PetId: {}, VeterinarianoId: {}",
                request.getPetId(), request.getVeterinarianId());

        Pet pet = petRepository.findById(request.getPetId())
                .orElseThrow(() -> new ResourceNotFoundException("Mascota no encontrada"));

        User veterinarian = userRepository.findById(request.getVeterinarianId())
                .orElseThrow(() -> new ResourceNotFoundException("Veterinario no encontrado"));

        if (!veterinarian.getRole().equals("VETERINARIAN")) {
            throw new InvalidOperationException("El usuario debe tener rol de veterinario");
        }

        boolean isAlreadyHospitalized = hospitalizationRepository
                .findActiveByPetId(pet.getId())
                .isPresent();

        if (isAlreadyHospitalized) {
            throw new InvalidOperationException("La mascota ya está hospitalizada");
        }

        Hospitalization hospitalization = Hospitalization.builder()
                .pet(pet)
                .veterinarian(veterinarian)
                .admissionReason(request.getAdmissionReason())
                .initialObservations(request.getInitialObservations())
                .admissionDate(LocalDateTime.now())
                .status(Hospitalization.HospitalizationStatus.ACTIVE)
                .build();

        Hospitalization saved = hospitalizationRepository.save(hospitalization);

        petService.updatePetStatus(pet.getId(), "HOSPITALIZED");

        auditService.registerAction(
                userId,
                "INICIO_HOSPITALIZACION",
                "Mascota " + pet.getName() + " internada",
                "PET",
                pet.getId()
        );

        log.info("Internamiento registrado exitosamente. HospitalizacionId: {}", saved.getId());
        return HospitalizationResponse.fromEntity(saved);
    }

    @Transactional(readOnly = true)
    public HospitalizationResponse getById(String id) {
        log.info("Recuperando hospitalización por ID: {}", id);

        Hospitalization hospitalization = hospitalizationRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Hospitalización no encontrada"));

        return HospitalizationResponse.fromEntity(hospitalization);
    }

    @Transactional(readOnly = true)
    public Page<HospitalizationResponse> getByPetId(String petId, Pageable pageable) {
        log.info("Recuperando historial de hospitalizaciones para mascota: {}", petId);

        petRepository.findById(petId)
                .orElseThrow(() -> new ResourceNotFoundException("Mascota no encontrada"));

        Page<Hospitalization> page = hospitalizationRepository.findByPetId(petId, pageable);
        return page.map(HospitalizationResponse::fromEntity);
    }

    @Transactional(readOnly = true)
    public List<HospitalizationResponse> getActiveHospitalizations() {
        log.info("Recuperando todas las hospitalizaciones activas");

        List<Hospitalization> active = hospitalizationRepository.findAllActive();
        return active.stream()
                .map(HospitalizationResponse::fromEntity)
                .collect(Collectors.toList());
    }

    public void dischargeWithStatus(String hospitalizationId,
                                    Hospitalization.DischargeStatus status,
                                    String observations,
                                    String userId) {
        log.info("Procesando alta de hospitalización. Id: {}, Estado: {}", hospitalizationId, status);

        Hospitalization hospitalization = hospitalizationRepository.findById(hospitalizationId)
                .orElseThrow(() -> new ResourceNotFoundException("Hospitalización no encontrada"));

        if (!hospitalization.getStatus().equals(Hospitalization.HospitalizationStatus.ACTIVE)) {
            throw new InvalidOperationException("La hospitalización no está activa");
        }

        hospitalization.setDischargeDate(LocalDateTime.now());
        hospitalization.setDischargeStatus(status);
        hospitalization.setDischargeObservations(observations);
        hospitalization.setStatus(Hospitalization.HospitalizationStatus.DISCHARGED);

        hospitalizationRepository.save(hospitalization);

        updatePetStatusAfterDischarge(hospitalization.getPet(), status);

        auditService.registerAction(
                userId,
                "ALTA_HOSPITALIZACION",
                "Mascota " + hospitalization.getPet().getName() + " dada de alta. Estado: " + status,
                "PET",
                hospitalization.getPet().getId()
        );

        log.info("Alta registrada exitosamente. HospitalizacionId: {}", hospitalizationId);
    }

    private void updatePetStatusAfterDischarge(Pet pet, Hospitalization.DischargeStatus status) {
        switch (status) {
            case RECUPERADA:
                petService.updatePetStatus(pet.getId(), "ACTIVE");
                break;
            case FALLECIDA:
                petService.updatePetStatus(pet.getId(), "DECEASED");
                break;
            case TRASLADADA:
                petService.updatePetStatus(pet.getId(), "ACTIVE");
                break;
        }
    }
}