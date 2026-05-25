package com.breaze.genesis.audit.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AuditEventDto {
    private Long id;
    private String action;
    private String username;
    private String role;
    private String description;
    private String ipAddress;
    private LocalDateTime timestamp;
}