CREATE TABLE `citas` (
                         `id`            VARCHAR(191) NOT NULL,
                         `fecha_hora`    DATETIME(3)  NOT NULL,
                         `estado`        ENUM('AGENDADA', 'FINALIZADA', 'CANCELADA') NOT NULL DEFAULT 'AGENDADA',
                         `motivo_pago`   VARCHAR(191) NULL,
                         `cliente_id`    VARCHAR(191) NOT NULL,
                         `mascota_id`    VARCHAR(191) NOT NULL,
                         `veterinario_id` VARCHAR(191) NOT NULL,
                         `creado_en`     DATETIME(3)  NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
                         `actualizado_en` DATETIME(3) NOT NULL,

                         INDEX `citas_fecha_hora_idx`(`fecha_hora`),
                         INDEX `citas_veterinario_id_idx`(`veterinario_id`),
                         PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- Tabla de servicios agendados en cada cita
CREATE TABLE `servicios_agendados` (
                                       `id`       VARCHAR(191) NOT NULL,
                                       `nombre`   VARCHAR(191) NOT NULL,
                                       `precio`   DECIMAL(10, 2) NOT NULL,
                                       `cita_id`  VARCHAR(191) NOT NULL,

                                       PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- Claves foráneas
ALTER TABLE `citas`
    ADD CONSTRAINT `citas_cliente_id_fkey`
        FOREIGN KEY (`cliente_id`) REFERENCES `clientes`(`id`)
            ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE `citas`
    ADD CONSTRAINT `citas_mascota_id_fkey`
        FOREIGN KEY (`mascota_id`) REFERENCES `mascotas`(`id`)
            ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE `citas`
    ADD CONSTRAINT `citas_veterinario_id_fkey`
        FOREIGN KEY (`veterinario_id`) REFERENCES `usuarios`(`id`)
            ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE `servicios_agendados`
    ADD CONSTRAINT `servicios_agendados_cita_id_fkey`
        FOREIGN KEY (`cita_id`) REFERENCES `citas`(`id`)
            ON DELETE RESTRICT ON UPDATE CASCADE;