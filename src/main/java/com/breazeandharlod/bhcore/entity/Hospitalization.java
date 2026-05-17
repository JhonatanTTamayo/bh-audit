package com.breazeandharlod.bhcore.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;

@Entity
@Table(name = "hospitalizaciones")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Hospitalization {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private String id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "mascota_id", nullable = false)
    private Pet pet;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "veterinario_id", nullable = false)
    private User veterinarian;

    @Column(name = "motivo_ingreso", nullable = false, length = 500)
    private String admissionReason;

    @Column(name = "observaciones_iniciales", length = 1000)
    private String initialObservations;

    @Column(name = "fecha_ingreso", nullable = false)
    private LocalDateTime admissionDate;

    @Column(name = "fecha_alta")
    private LocalDateTime dischargeDate;

    @Enumerated(EnumType.STRING)
    @Column(name = "estado_egreso", length = 50)
    private DischargeStatus dischargeStatus;

    @Column(name = "observaciones_alta", length = 1000)
    private String dischargeObservations;

    @Enumerated(EnumType.STRING)
    @Column(name = "estado", nullable = false)
    private HospitalizationStatus status;

    @Column(name = "creado_en", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "actualizado_en")
    private LocalDateTime updatedAt;

    @PrePersist
    protected void onCreate() {
        this.createdAt = LocalDateTime.now();
        this.updatedAt = LocalDateTime.now();
        this.status = HospitalizationStatus.ACTIVE;
    }

    @PreUpdate
    protected void onUpdate() {
        this.updatedAt = LocalDateTime.now();
    }

    public enum HospitalizationStatus {
        ACTIVE, DISCHARGED
    }

    public enum DischargeStatus {
        RECUPERADA, FALLECIDA, TRASLADADA
    }
}