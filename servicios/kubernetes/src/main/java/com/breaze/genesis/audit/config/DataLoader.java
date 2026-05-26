package com.breaze.genesis.audit.config;

import com.breaze.genesis.audit.dto.AuditEventCreateDto;
import com.breaze.genesis.audit.service.AuditEventService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
@Slf4j
public class DataLoader implements CommandLineRunner {

    private final AuditEventService auditEventService;

    @Override
    public void run(String... args) {
        log.info("Loading sample audit events...");

        // Sample data for testing
        auditEventService.createEvent(AuditEventCreateDto.builder()
                .action("LOGIN_SUCCESS")
                .username("admin@breaze.com")
                .role("ADMIN")
                .description("Usuario admin inició sesión exitosamente")
                .ipAddress("192.168.1.100")
                .build());

        auditEventService.createEvent(AuditEventCreateDto.builder()
                .action("CREATE_APPOINTMENT")
                .username("reception@breaze.com")
                .role("RECEPTIONIST")
                .description("Cita creada para mascota 'Luna'")
                .ipAddress("192.168.1.101")
                .build());

        auditEventService.createEvent(AuditEventCreateDto.builder()
                .action("MEDICAL_RECORD_CREATED")
                .username("vet@breaze.com")
                .role("VETERINARIAN")
                .description("Historial médico registrado para mascota 'Max'")
                .ipAddress("192.168.1.102")
                .build());

        log.info("Sample data loaded successfully");
    }
}