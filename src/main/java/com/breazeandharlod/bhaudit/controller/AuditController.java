package com.breazeandharlod.bhaudit.controller;

import com.breazeandharlod.bhaudit.dto.request.AuditEventRequest;
import com.breazeandharlod.bhaudit.dto.response.AuditEventResponse;
import com.breazeandharlod.bhaudit.service.AuditService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;

@RestController
@RequestMapping("/api/v1/audit-events")
@RequiredArgsConstructor
public class AuditController {

    private final AuditService auditService;
    private static final DateTimeFormatter DATE_FORMATTER = DateTimeFormatter.ISO_DATE_TIME;

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<AuditEventResponse> registerEvent(
            @Valid @RequestBody AuditEventRequest request) {

        AuditEventResponse response = auditService.registerAction(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<AuditEventResponse> getById(@PathVariable String id) {
        AuditEventResponse response = auditService.getById(id);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/usuario/{userId}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Page<AuditEventResponse>> getByUserId(
            @PathVariable String userId,
            Pageable pageable) {

        Page<AuditEventResponse> response = auditService.getByUserId(userId, pageable);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/accion/{actionType}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Page<AuditEventResponse>> getByActionType(
            @PathVariable String actionType,
            Pageable pageable) {

        Page<AuditEventResponse> response = auditService.getByActionType(actionType, pageable);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/rango-fechas")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Page<AuditEventResponse>> getByDateRange(
            @RequestParam String startDate,
            @RequestParam String endDate,
            Pageable pageable) {

        LocalDateTime start = LocalDateTime.parse(startDate, DATE_FORMATTER);
        LocalDateTime end = LocalDateTime.parse(endDate, DATE_FORMATTER);

        Page<AuditEventResponse> response = auditService.getByDateRange(start, end, pageable);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/filtros")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Page<AuditEventResponse>> getByMultipleFilters(
            @RequestParam String userId,
            @RequestParam String actionType,
            @RequestParam String startDate,
            @RequestParam String endDate,
            Pageable pageable) {

        LocalDateTime start = LocalDateTime.parse(startDate, DATE_FORMATTER);
        LocalDateTime end = LocalDateTime.parse(endDate, DATE_FORMATTER);

        Page<AuditEventResponse> response = auditService.getByMultipleFilters(userId, actionType, start, end, pageable);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/todos")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<AuditEventResponse>> getAllEvents() {
        List<AuditEventResponse> response = auditService.getAllEvents();
        return ResponseEntity.ok(response);
    }
}