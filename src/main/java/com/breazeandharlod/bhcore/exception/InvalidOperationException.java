CREATE TABLE hospitalizaciones (
        id VARCHAR(36) PRIMARY KEY,
mascota_id VARCHAR(36) NOT NULL,
veterinario_id VARCHAR(36) NOT NULL,
motivo_ingreso VARCHAR(500) NOT NULL,
observaciones_iniciales VARCHAR(1000),
fecha_ingreso DATETIME NOT NULL,
fecha_alta DATETIME,
estado_egreso VARCHAR(50),
observaciones_alta VARCHAR(1000),
estado VARCHAR(20) NOT NULL DEFAULT 'ACTIVE',
creado_en DATETIME NOT NULL,
actualizado_en DATETIME,
FOREIGN KEY (mascota_id) REFERENCES mascotas(id) ON DELETE CASCADE,
FOREIGN KEY (veterinario_id) REFERENCES usuarios(id)
        );

CREATE INDEX idx_hospitalizaciones_mascota ON hospitalizaciones(mascota_id);
CREATE INDEX idx_hospitalizaciones_veterinario ON hospitalizaciones(veterinario_id);
CREATE INDEX idx_hospitalizaciones_estado ON hospitalizaciones(estado);