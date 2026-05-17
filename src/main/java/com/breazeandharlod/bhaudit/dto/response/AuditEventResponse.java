package com.breazeandharlod.bhaudit.dto.response;

import com.breazeandharlod.bhaudit.entity.AuditEvent;
import com.fasterxml.jackson.annotation.JsonFormat;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AuditEventResponse {

    private String id;
    private String userId;
    private String userName;
    private String userRole;
    private String actionType;
    private String description;
    private String resourceType;
    private String resourceId;

    @JsonFormat(pattern = "yyyy-MM-dd HH:mm:ss")
    private LocalDateTime actionDateTime;

    @JsonFormat(pattern = "yyyy-MM-dd HH:mm:ss")
    private LocalDateTime createdAt;

    public static AuditEventResponse fromEntity(AuditEvent event) {
        return AuditEventResponse.builder()
                .id(event.getId())
                .userId(event.getUserId())
                .userName(event.getUserName())
                .userRole(event.getUserRole().toString())
                .actionType(event.getActionType().toString())
                .description(event.getDescription())
                .resourceType(event.getResourceType())
                .resourceId(event.getResourceId())
                .actionDateTime(event.getActionDateTime())
                .createdAt(event.getCreatedAt())
                .build();
    }
}