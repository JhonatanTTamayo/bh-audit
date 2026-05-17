package com.breazeandharlod.bhcore.dto.response;

import com.breazeandharlod.bhcore.entity.Hospitalization;
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
public class HospitalizationResponse {

    private String id;
    private String petId;
    private String petName;
    private String veterinarianId;
    private String veterinarianName;
    private String admissionReason;
    private String initialObservations;

    @JsonFormat(pattern = "yyyy-MM-dd HH:mm:ss")
    private LocalDateTime admissionDate;

    @JsonFormat(pattern = "yyyy-MM-dd HH:mm:ss")
    private LocalDateTime dischargeDate;

    private String status;
    private String dischargeStatus;
    private String dischargeObservations;

    @JsonFormat(pattern = "yyyy-MM-dd HH:mm:ss")
    private LocalDateTime createdAt;

    @JsonFormat(pattern = "yyyy-MM-dd HH:mm:ss")
    private LocalDateTime updatedAt;

    public static HospitalizationResponse fromEntity(Hospitalization hospitalization) {
        return HospitalizationResponse.builder()
                .id(hospitalization.getId())
                .petId(hospitalization.getPet().getId())
                .petName(hospitalization.getPet().getName())
                .veterinarianId(hospitalization.getVeterinarian().getId())
                .veterinarianName(hospitalization.getVeterinarian().getName())
                .admissionReason(hospitalization.getAdmissionReason())
                .initialObservations(hospitalization.getInitialObservations())
                .admissionDate(hospitalization.getAdmissionDate())
                .dischargeDate(hospitalization.getDischargeDate())
                .status(hospitalization.getStatus().toString())
                .dischargeStatus(hospitalization.getDischargeStatus() != null ?
                        hospitalization.getDischargeStatus().toString() : null)
                .dischargeObservations(hospitalization.getDischargeObservations())
                .createdAt(hospitalization.getCreatedAt())
                .updatedAt(hospitalization.getUpdatedAt())
                .build();
    }
}