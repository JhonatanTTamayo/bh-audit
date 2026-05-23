-- CreateTable
CREATE TABLE `historial_medico` (
    `id` VARCHAR(191) NOT NULL,
    `motivo_visita` TEXT NOT NULL,
    `diagnostico` TEXT NOT NULL,
    `tratamiento` TEXT NOT NULL,
    `peso` DECIMAL(10, 2) NOT NULL,
    `fecha_proxima_visita` DATE NULL,
    `editable_hasta` DATETIME(3) NOT NULL,
    `mascota_id` VARCHAR(191) NOT NULL,
    `cita_id` VARCHAR(191) NOT NULL,
    `veterinario_id` VARCHAR(191) NOT NULL,
    `creado_en` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `actualizado_en` DATETIME(3) NOT NULL,

    UNIQUE INDEX `historial_medico_cita_id_key`(`cita_id`),
    INDEX `historial_medico_mascota_id_idx`(`mascota_id`),
    INDEX `historial_medico_veterinario_id_idx`(`veterinario_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `medicamentos_prescritos` (
    `id` VARCHAR(191) NOT NULL,
    `dosis` VARCHAR(191) NOT NULL,
    `duracion` VARCHAR(191) NOT NULL,
    `historial_id` VARCHAR(191) NOT NULL,
    `producto_id` VARCHAR(191) NOT NULL,
    `creado_en` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `medicamentos_prescritos_historial_id_idx`(`historial_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `vacunas` (
    `id` VARCHAR(191) NOT NULL,
    `nombre` VARCHAR(191) NOT NULL,
    `fecha_aplicacion` DATE NOT NULL,
    `fecha_proxima_dosis` DATE NOT NULL,
    `observaciones` TEXT NULL,
    `producto_id` VARCHAR(191) NULL,
    `mascota_id` VARCHAR(191) NOT NULL,
    `veterinario_id` VARCHAR(191) NOT NULL,
    `creado_en` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `vacunas_mascota_id_idx`(`mascota_id`),
    INDEX `vacunas_veterinario_id_idx`(`veterinario_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `historial_medico` ADD CONSTRAINT `historial_medico_mascota_id_fkey` FOREIGN KEY (`mascota_id`) REFERENCES `mascotas`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `historial_medico` ADD CONSTRAINT `historial_medico_cita_id_fkey` FOREIGN KEY (`cita_id`) REFERENCES `citas`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `historial_medico` ADD CONSTRAINT `historial_medico_veterinario_id_fkey` FOREIGN KEY (`veterinario_id`) REFERENCES `usuarios`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `medicamentos_prescritos` ADD CONSTRAINT `medicamentos_prescritos_historial_id_fkey` FOREIGN KEY (`historial_id`) REFERENCES `historial_medico`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `vacunas` ADD CONSTRAINT `vacunas_mascota_id_fkey` FOREIGN KEY (`mascota_id`) REFERENCES `mascotas`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `vacunas` ADD CONSTRAINT `vacunas_veterinario_id_fkey` FOREIGN KEY (`veterinario_id`) REFERENCES `usuarios`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
