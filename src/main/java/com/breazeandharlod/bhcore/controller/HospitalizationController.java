package com.breazeandharlod.bhcore.controller;

import com.breazeandharlod.bhcore.dto.request.HospitalizationRequest;
import com.breazeandharlod.bhcore.dto.request.DischargeRequest;
import com.breazeandharlod.bhcore.dto.response.HospitalizationResponse;
import com.breazeandharlod.bhcore.entity.Hospitalization;
import com.breazeandharlod.bhcore.service.HospitalizationService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/hospitalizaciones")
@RequiredArgsConstructor
public class HospitalizationController {

    private final HospitalizationService hospitalizationService;

    @PostMapping
    @PreAuthorize("hasRole('VETERINARIAN')")
    public ResponseEntity<HospitalizationResponse> admitPet(
            @Valid @RequestBody HospitalizationRequest request,
            Authentication authentication) {

        String userId = authentication.getName();
        HospitalizationResponse response = hospitalizationService.admitPet(request, userId);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('VETERINARIAN', 'RECEPTIONIST', 'ADMIN')")
    public ResponseEntity<HospitalizationResponse> getById(@PathVariable String id) {
        HospitalizationResponse response = hospitalizationService.getById(id);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/mascota/{petId}")
    @PreAuthorize("hasAnyRole('VETERINARIAN', 'RECEPTIONIST', 'ADMIN', 'CLIENT')")
    public ResponseEntity<Page<HospitalizationResponse>> getByPetId(
            @PathVariable String petId,
            Pageable pageable) {

        Page<HospitalizationResponse> response = hospitalizationService.getByPetId(petId, pageable);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/activas")
    @PreAuthorize("hasAnyRole('VETERINARIAN', 'ADMIN')")
    public ResponseEntity<List<HospitalizationResponse>> getActiveHospitalizations() {
        List<HospitalizationResponse> response = hospitalizationService.getActiveHospitalizations();
        return ResponseEntity.ok(response);
    }

    @PatchMapping("/{id}/alta")
    @PreAuthorize("hasRole('VETERINARIAN')")
    public ResponseEntity<HospitalizationResponse> dischargeWithStatus(
            @PathVariable String id,
            @Valid @RequestBody DischargeRequest request,
            Authentication authentication) {

        String userId = authentication.getName();
        Hospitalization.DischargeStatus status =
                Hospitalization.DischargeStatus.valueOf(request.getStatus().toUpperCase());

        hospitalizationService.dischargeWithStatus(id, status, request.getObservations(), userId);
        HospitalizationResponse response = hospitalizationService.getById(id);
        return ResponseEntity.ok(response);
    }
}