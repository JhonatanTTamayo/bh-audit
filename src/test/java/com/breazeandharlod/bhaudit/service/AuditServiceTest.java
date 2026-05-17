package com.breazeandharlod.bhaudit.service;

import com.breazeandharlod.bhaudit.dto.request.AuditEventRequest;
import com.breazeandharlod.bhaudit.dto.response.AuditEventResponse;
import com.breazeandharlod.bhaudit.entity.AuditEvent;
import com.breazeandharlod.bhaudit.exception.AuditException;
import com.breazeandharlod.bhaudit.repository.AuditEventRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDateTime;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class AuditServiceTest {

    @Mock
    private AuditEventRepository auditEventRepository;

    @InjectMocks
    private AuditService auditService;

    private AuditEventRequest request;
    private AuditEvent event;

    @BeforeEach
    void setUp() {
        request = new AuditEventRequest();
        request.setUserId("user-123");
        request.setUserName("Dr. García");
        request.setUserRole("VETERINARIO");
        request.setActionType("CREACION_CITA");
        request.setDescription("Se agendó una cita para la mascota Luna");
        request.setResourceType("PET");
        request.setResourceId("pet-456");

        event = AuditEvent.builder()
                .id("event-789")
                .userId("user-123")
                .userName("Dr. García")
                .userRole(AuditEvent.UserRole.VETERINARIO)
                .actionType(AuditEvent.AuditActionType.CREACION_CITA)
                .description("Se agendó una cita para la mascota Luna")
                .resourceType("PET")
                .resourceId("pet-456")
                .actionDateTime(LocalDateTime.now())
                .build();
    }

    @Test
    void testRegisterAction_Success() {
        when(auditEventRepository.save(any(AuditEvent.class))).thenReturn(event);

        AuditEventResponse response = auditService.registerAction(request);

        assertNotNull(response);
        assertEquals("user-123", response.getUserId());
        assertEquals("Dr. García", response.getUserName());
        assertEquals("VETERINARIO", response.getUserRole());
        assertEquals("CREACION_CITA", response.getActionType());
        verify(auditEventRepository, times(1)).save(any(AuditEvent.class));
    }

    @Test
    void testRegisterAction_InvalidRole() {
        request.setUserRole("INVALIDO");

        assertThrows(AuditException.class, () -> {
            auditService.registerAction(request);
        });
    }

    @Test
    void testRegisterAction_InvalidActionType() {
        request.setActionType("ACCION_INVALIDA");

        assertThrows(AuditException.class, () -> {
            auditService.registerAction(request);
        });
    }

    @Test
    void testGetById_Success() {
        when(auditEventRepository.findById("event-789")).thenReturn(Optional.of(event));

        AuditEventResponse response = auditService.getById("event-789");

        assertNotNull(response);
        assertEquals("user-123", response.getUserId());
    }

    @Test
    void testGetById_NotFound() {
        when(auditEventRepository.findById("invalid")).thenReturn(Optional.empty());

        assertThrows(AuditException.class, () -> {
            auditService.getById("invalid");
        });
    }
}