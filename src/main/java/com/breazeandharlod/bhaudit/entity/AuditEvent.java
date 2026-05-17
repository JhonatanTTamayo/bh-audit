package com.breazeandharlod.bhaudit.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;

@Entity
@Table(name = "audit_events")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AuditEvent {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private String id;

    @Column(name = "usuario_id", nullable = false)
    private String userId;

    @Column(name = "nombre_usuario", nullable = false, length = 255)
    private String userName;

    @Enumerated(EnumType.STRING)
    @Column(name = "rol_usuario", nullable = false)
    private UserRole userRole;

    @Enumerated(EnumType.STRING)
    @Column(name = "tipo_accion", nullable = false)
    private AuditActionType actionType;

    @Column(name = "descripcion", nullable = false, length = 1000)
    private String description;

    @Column(name = "tipo_recurso", length = 50)
    private String resourceType;

    @Column(name = "id_recurso", length = 36)
    private String resourceId;

    @Column(name = "fecha_hora", nullable = false)
    private LocalDateTime actionDateTime;

    @Column(name = "creado_en", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @PrePersist
    protected void onCreate() {
        this.createdAt = LocalDateTime.now();
        if (this.actionDateTime == null) {
            this.actionDateTime = LocalDateTime.now();
        }
    }

    public enum UserRole {
        CLIENTE, RECEPCIONISTA, VETERINARIO, ADMINISTRADOR
    }

    public enum AuditActionType {
        REGISTRO_USUARIO,
        VERIFICACION_CORREO,
        APROBACION_CUENTA,
        RECHAZO_CUENTA,
        LOGIN_EXITOSO,
        LOGIN_FALLIDO,
        CREACION_CITA,
        CAMBIO_ESTADO_CITA,
        PAGO_CITA,
        CREACION_HISTORIAL,
        EDICION_HISTORIAL,
        REGISTRO_VACUNA,
        INICIO_HOSPITALIZACION,
        ALTA_HOSPITALIZACION,
        CREACION_FACTURA,
        ANULACION_FACTURA,
        AJUSTE_INVENTARIO,
        CREACION_SERVICIO,
        EDICION_SERVICIO,
        DESACTIVACION_SERVICIO,
        SUSPENSION_USUARIO
    }
}