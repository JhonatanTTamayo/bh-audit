CREATE TABLE audit_events (
                              id VARCHAR(36) PRIMARY KEY,
                              usuario_id VARCHAR(36) NOT NULL,
                              nombre_usuario VARCHAR(255) NOT NULL,
                              rol_usuario VARCHAR(50) NOT NULL,
                              tipo_accion VARCHAR(50) NOT NULL,
                              descripcion VARCHAR(1000) NOT NULL,
                              tipo_recurso VARCHAR(50),
                              id_recurso VARCHAR(36),
                              fecha_hora DATETIME NOT NULL,
                              creado_en DATETIME NOT NULL
);

CREATE INDEX idx_audit_usuario ON audit_events(usuario_id);
CREATE INDEX idx_audit_accion ON audit_events(tipo_accion);
CREATE INDEX idx_audit_rol ON audit_events(rol_usuario);
CREATE INDEX idx_audit_fecha ON audit_events(fecha_hora);
CREATE INDEX idx_audit_recurso ON audit_events(id_recurso);