package com.breazeandharlod.bhcore.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class HospitalizationRequest {

    @NotNull(message = "El ID de la mascota es requerido")
    private String petId;

    @NotNull(message = "El ID del veterinario es requerido")
    private String veterinarianId;

    @NotBlank(message = "El motivo de ingreso es requerido")
    @Size(min = 10, max = 500, message = "El motivo debe tener entre 10 y 500 caracteres")
    private String admissionReason;

    @Size(max = 1000, message = "Las observaciones no pueden exceder 1000 caracteres")
    private String initialObservations;
}