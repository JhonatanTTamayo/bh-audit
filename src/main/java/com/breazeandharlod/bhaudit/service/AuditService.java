package com.breazeandharlod.bhaudit.service;

import com.breazeandharlod.bhaudit.dto.request.AuditEventRequest;
import com.breazeandharlod.bhaudit.dto.response.AuditEventResponse;
import com.breazeandharlod.bhaudit.entity.AuditEvent;
import com.breazeandharlod.bhaudit.exception.AuditException;
import com.breazeandharlod.bhaudit.repository.AuditEventRepository;
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
public class AuditService {

    private final AuditEventRepository auditEventRepository;

    public AuditEventResponse registerAction(AuditEventRequest request) {
        log.info("Registrando acción de auditoría. Usuario: {}, Acción: {}",
                request.getUserId(), request.getActionType());

        try {
            AuditEvent.UserRole userRole = AuditEvent.UserRole.valueOf(request.getUserRole().toUpperCase());
            AuditEvent.AuditActionType actionType = AuditEvent.AuditActionType.valueOf(request.getActionType().toUpperCase());

            AuditEvent event = AuditEvent.builder()
                    .userId(request.getUserId())
                    .userName(request.getUserName())
                    .userRole(userRole)
                    .actionType(actionType)
                    .description(request.getDescription())
                    .resourceType(request.getResourceType())
                    .resourceId(request.getResourceId())
                    .actionDateTime(LocalDateTime.now())
                    .build();

            AuditEvent saved = auditEventRepository.save(event);
            log.info("Acción registrada exitosamente. EventId: {}", saved.getId());
            return AuditEventResponse.fromEntity(saved);
        } catch (IllegalArgumentException e) {
            log.error("Error al registrar acción: valor inválido para rol o tipo de acción", e);
            throw new AuditException("Rol o tipo de acción inválido", e);
        }
    }

    @Transactional(readOnly = true)
    public AuditEventResponse getById(String id) {
        log.info("Recuperando evento de auditoría por ID: {}", id);

        AuditEvent event = auditEventRepository.findById(id)
                .orElseThrow(() -> new AuditException("Evento de auditoría no encontrado"));

        return AuditEventResponse.fromEntity(event);
    }

    @Transactional(readOnly = true)
    public Page<AuditEventResponse> getByUserId(String userId, Pageable pageable) {
        log.info("Recuperando eventos del usuario: {}", userId);

        Page<AuditEvent> page = auditEventRepository.findByUserId(userId, pageable);
        return page.map(AuditEventResponse::fromEntity);
    }

    @Transactional(readOnly = true)
    public Page<AuditEventResponse> getByActionType(String actionType, Pageable pageable) {
        log.info("Recuperando eventos por tipo de acción: {}", actionType);

        try {
            AuditEvent.AuditActionType type = AuditEvent.AuditActionType.valueOf(actionType.toUpperCase());
            Page<AuditEvent> page = auditEventRepository.findByActionType(type, pageable);
            return page.map(AuditEventResponse::fromEntity);
        } catch (IllegalArgumentException e) {
            log.error("Tipo de acción inválido: {}", actionType);
            throw new AuditException("Tipo de acción inválido");
        }
    }

    @Transactional(readOnly = true)
    public Page<AuditEventResponse> getByDateRange(LocalDateTime startDate, LocalDateTime endDate, Pageable pageable) {
        log.info("Recuperando eventos entre {} y {}", startDate, endDate);

        if (startDate.isAfter(endDate)) {
            throw new AuditException("La fecha de inicio no puede ser posterior a la fecha final");
        }

        Page<AuditEvent> page = auditEventRepository.findByDateRange(startDate, endDate, pageable);
        return page.map(AuditEventResponse::fromEntity);
    }

    @Transactional(readOnly = true)
    public Page<AuditEventResponse> getByMultipleFilters(String userId, String actionType,
                                                         LocalDateTime startDate, LocalDateTime endDate,
                                                         Pageable pageable) {
        log.info("Recuperando eventos con filtros múltiples. Usuario: {}, Acción: {}", userId, actionType);

        try {
            AuditEvent.AuditActionType type = AuditEvent.AuditActionType.valueOf(actionType.toUpperCase());
            Page<AuditEvent> page = auditEventRepository.findByMultipleFilters(userId, type, startDate, endDate, pageable);
            return page.map(AuditEventResponse::fromEntity);
        } catch (IllegalArgumentException e) {
            log.error("Tipo de acción inválido: {}", actionType);
            throw new AuditException("Tipo de acción inválido");
        }
    }

    @Transactional(readOnly = true)
    public List<AuditEventResponse> getAllEvents() {
        log.info("Recuperando todos los eventos de auditoría");

        List<AuditEvent> events = auditEventRepository.findAllOrderByDateDesc();
        return events.stream()
                .map(AuditEventResponse::fromEntity)
                .collect(Collectors.toList());
    }
}