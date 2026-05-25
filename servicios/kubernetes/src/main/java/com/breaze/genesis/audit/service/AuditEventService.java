package com.breaze.genesis.audit.service;

import com.breaze.genesis.audit.dto.AuditEventCreateDto;
import com.breaze.genesis.audit.dto.AuditEventDto;
import com.breaze.genesis.audit.dto.PageResponseDto;
import com.breaze.genesis.audit.model.AuditEvent;
import com.breaze.genesis.audit.repository.AuditEventRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import com.breaze.genesis.audit.spec.AuditEventSpecification;
import java.time.LocalDateTime;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class AuditEventService {

    private final AuditEventRepository auditEventRepository;

    @Transactional
    public AuditEventDto createEvent(AuditEventCreateDto createDto) {
        log.info("Creating audit event: action={}, user={}", createDto.getAction(), createDto.getUsername());

        AuditEvent event = AuditEvent.builder()
                .action(createDto.getAction())
                .username(createDto.getUsername())
                .role(createDto.getRole())
                .description(createDto.getDescription())
                .ipAddress(createDto.getIpAddress())
                .build();

        AuditEvent saved = auditEventRepository.save(event);
        return convertToDto(saved);
    }

    @Transactional(readOnly = true)
    public PageResponseDto<AuditEventDto> getEvents(String action, String username, String role,
                                                    LocalDateTime startDate, LocalDateTime endDate,
                                                    int page, int size) {
        Pageable pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "timestamp"));

        Page<AuditEvent> eventsPage = auditEventRepository.findAll(
                AuditEventSpecification.filterBy(action, username, role, startDate, endDate),
                pageable
        );

        return PageResponseDto.<AuditEventDto>builder()
                .content(eventsPage.getContent().stream()
                        .map(this::convertToDto)
                        .collect(Collectors.toList()))
                .pageNumber(eventsPage.getNumber())
                .pageSize(eventsPage.getSize())
                .totalElements(eventsPage.getTotalElements())
                .totalPages(eventsPage.getTotalPages())
                .last(eventsPage.isLast())
                .build();
    }

    private AuditEventDto convertToDto(AuditEvent event) {
        return AuditEventDto.builder()
                .id(event.getId())
                .action(event.getAction())
                .username(event.getUsername())
                .role(event.getRole())
                .description(event.getDescription())
                .ipAddress(event.getIpAddress())
                .timestamp(event.getTimestamp())
                .build();
    }
}