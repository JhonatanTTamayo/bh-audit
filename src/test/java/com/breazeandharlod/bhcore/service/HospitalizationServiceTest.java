package com.breazeandharlod.bhcore.service;

import com.breazeandharlod.bhcore.dto.request.HospitalizationRequest;
import com.breazeandharlod.bhcore.dto.response.HospitalizationResponse;
import com.breazeandharlod.bhcore.entity.Hospitalization;
import com.breazeandharlod.bhcore.entity.Pet;
import com.breazeandharlod.bhcore.entity.User;
import com.breazeandharlod.bhcore.exception.InvalidOperationException;
import com.breazeandharlod.bhcore.exception.ResourceNotFoundException;
import com.breazeandharlod.bhcore.repository.HospitalizationRepository;
import com.breazeandharlod.bhcore.repository.PetRepository;
import com.breazeandharlod.bhcore.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class HospitalizationServiceTest {

    @Mock
    private HospitalizationRepository hospitalizationRepository;

    @Mock
    private PetRepository petRepository;

    @Mock
    private UserRepository userRepository;

    @Mock
    private AuditService auditService;

    @Mock
    private PetService petService;

    @InjectMocks
    private HospitalizationService hospitalizationService;

    private HospitalizationRequest request;
    private Pet pet;
    private User veterinarian;
    private Hospitalization hospitalization;

    @BeforeEach
    void setUp() {
        pet = Pet.builder()
                .id("pet-123")
                .name("Luna")
                .status("ACTIVE")
                .build();

        veterinarian = User.builder()
                .id("vet-456")
                .name("Dr. García")
                .role("VETERINARIAN")
                .build();

        request = new HospitalizationRequest();
        request.setPetId(pet.getId());
        request.setVeterinarianId(veterinarian.getId());
        request.setAdmissionReason("Fractura de pata trasera");
        request.setInitialObservations("Mascota en condición estable");

        hospitalization = Hospitalization.builder()
                .id("hosp-789")
                .pet(pet)
                .veterinarian(veterinarian)
                .admissionReason(request.getAdmissionReason())
                .initialObservations(request.getInitialObservations())
                .status(Hospitalization.HospitalizationStatus.ACTIVE)
                .build();
    }

    @Test
    void testAdmitPet_Success() {
        when(petRepository.findById("pet-123")).thenReturn(Optional.of(pet));
        when(userRepository.findById("vet-456")).thenReturn(Optional.of(veterinarian));
        when(hospitalizationRepository.findActiveByPetId("pet-123")).thenReturn(Optional.empty());
        when(hospitalizationRepository.save(any(Hospitalization.class))).thenReturn(hospitalization);

        HospitalizationResponse response = hospitalizationService.admitPet(request, "user-123");

        assertNotNull(response);
        assertEquals("Luna", response.getPetName());
        assertEquals("Dr. García", response.getVeterinarianName());
        verify(petService, times(1)).updatePetStatus("pet-123", "HOSPITALIZED");
        verify(auditService, times(1)).registerAction(anyString(), anyString(), anyString(), anyString(), anyString());
    }

    @Test
    void testAdmitPet_PetNotFound() {
        when(petRepository.findById("pet-123")).thenReturn(Optional.empty());

        assertThrows(ResourceNotFoundException.class, () -> {
            hospitalizationService.admitPet(request, "user-123");
        });
    }

    @Test
    void testAdmitPet_VeterinarianNotFound() {
        when(petRepository.findById("pet-123")).thenReturn(Optional.of(pet));
        when(userRepository.findById("vet-456")).thenReturn(Optional.empty());

        assertThrows(ResourceNotFoundException.class, () -> {
            hospitalizationService.admitPet(request, "user-123");
        });
    }

    @Test
    void testAdmitPet_PetAlreadyHospitalized() {
        when(petRepository.findById("pet-123")).thenReturn(Optional.of(pet));
        when(userRepository.findById("vet-456")).thenReturn(Optional.of(veterinarian));
        when(hospitalizationRepository.findActiveByPetId("pet-123")).thenReturn(Optional.of(hospitalization));

        assertThrows(InvalidOperationException.class, () -> {
            hospitalizationService.admitPet(request, "user-123");
        });
    }

    @Test
    void testGetById_Success() {
        when(hospitalizationRepository.findById("hosp-789")).thenReturn(Optional.of(hospitalization));

        HospitalizationResponse response = hospitalizationService.getById("hosp-789");

        assertNotNull(response);
        assertEquals("Luna", response.getPetName());
    }

    @Test
    void testGetById_NotFound() {
        when(hospitalizationRepository.findById("invalid")).thenReturn(Optional.empty());

        assertThrows(ResourceNotFoundException.class, () -> {
            hospitalizationService.getById("invalid");
        });
    }

    @Test
    void testDischargeWithStatus_Success() {
        when(hospitalizationRepository.findById("hosp-789")).thenReturn(Optional.of(hospitalization));

        hospitalizationService.dischargeWithStatus(
                "hosp-789",
                Hospitalization.DischargeStatus.RECUPERADA,
                "Mascota recuperada completamente",
                "user-123"
        );

        verify(petService, times(1)).updatePetStatus("pet-123", "ACTIVE");
        verify(auditService, times(1)).registerAction(anyString(), anyString(), anyString(), anyString(), anyString());
    }
}