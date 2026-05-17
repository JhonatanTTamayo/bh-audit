package com.breazeandharlod.bhaudit.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class AuditEventRequest {

    @NotNull(message = "El ID del usuario es requerido")
    private String userId;

    @NotBlank(message = "El nombre del usuario es requerido")
    @Size(max = 255, message = "El nombre no puede exceder 255 caracteres")
    private String userName;

    @NotNull(message = "El rol del usuario es requerido")
    private String userRole;

    @NotNull(message = "El tipo de acción es requerido")
    private String actionType;

    @NotBlank(message = "La descripción es requerida")
    @Size(min = 5, max = 1000, message = "La descripción debe tener entre 5 y 1000 caracteres")
    private String description;

    @Size(max = 50, message = "El tipo de recurso no puede exceder 50 caracteres")
    private String resourceType;

    @Size(max = 36, message = "El ID del recurso no puede exceder 36 caracteres")
    private String resourceId;
}