package com.breaze.genesis.audit.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AuditEventCreateDto {
    @NotBlank(message = "Action is required")
    private String action;

    @NotBlank(message = "Username is required")
    private String username;

    @NotBlank(message = "Role is required")
    private String role;

    @NotBlank(message = "Description is required")
    private String description;

    @NotBlank(message = "IP address is required")
    private String ipAddress;
}