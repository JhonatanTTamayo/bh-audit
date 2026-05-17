package com.breazeandharlod.bhcore.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class DischargeRequest {

    @NotBlank(message = "El estado de egreso es requerido")
    @Pattern(regexp = "RECUPERADA|FALLECIDA|TRASLADADA",
            message = "El estado debe ser: RECUPERADA, FALLECIDA o TRASLADADA")
    private String status;

    @Size(max = 1000, message = "Las observaciones no pueden exceder 1000 caracteres")
    private String observations;
}