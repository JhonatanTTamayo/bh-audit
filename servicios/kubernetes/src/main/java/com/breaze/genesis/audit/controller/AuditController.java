package com.breaze.genesis.audit.controller;

import com.breaze.genesis.audit.dto.AuditEventCreateDto;
import com.breaze.genesis.audit.dto.AuditEventDto;
import com.breaze.genesis.audit.dto.PageResponseDto;
import com.breaze.genesis.audit.service.AuditEventService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;

@RestController
@RequestMapping("/events")
@RequiredArgsConstructor
public class AuditController {

    private final AuditEventService auditEventService;

    @PostMapping
    public ResponseEntity<AuditEventDto> createEvent(@Valid @RequestBody AuditEventCreateDto createDto) {
        return ResponseEntity.status(HttpStatus.CREATED).body(auditEventService.createEvent(createDto));
    }

    @GetMapping
    public ResponseEntity<PageResponseDto<AuditEventDto>> getEvents(
            @RequestParam(required = false) String action,
            @RequestParam(required = false) String username,
            @RequestParam(required = false) String role,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime startDate,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime endDate,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {

        return ResponseEntity.ok(auditEventService.getEvents(action, username, role, startDate, endDate, page, size));
    }
}