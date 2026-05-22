-- CreateTable
CREATE TABLE `mascotas` (
    `id` VARCHAR(191) NOT NULL,
    `nombre` VARCHAR(191) NOT NULL,
    `especie` VARCHAR(191) NOT NULL,
    `raza` VARCHAR(191) NULL,
    `edad` INTEGER NULL,
    `peso` DECIMAL(10, 2) NULL,
    `estado` ENUM('ACTIVA', 'HOSPITALIZADA', 'FALLECIDA') NOT NULL DEFAULT 'ACTIVA',
    `cliente_id` VARCHAR(191) NOT NULL,
    `creado_en` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `actualizado_en` DATETIME(3) NOT NULL,

    INDEX `mascotas_cliente_id_idx`(`cliente_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `servicios` (
    `id` VARCHAR(191) NOT NULL,
    `nombre` VARCHAR(191) NOT NULL,
    `descripcion` VARCHAR(191) NULL,
    `precio` DECIMAL(10, 2) NOT NULL,
    `activo` BOOLEAN NOT NULL DEFAULT true,
    `creado_en` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `actualizado_en` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `citas` (
    `id` VARCHAR(191) NOT NULL,
    `fecha` DATE NOT NULL,
    `hora` VARCHAR(5) NOT NULL,
    `estado` ENUM('CONFIRMADA', 'FINALIZADA', 'CANCELADA') NOT NULL DEFAULT 'CONFIRMADA',
    `monto_total` DECIMAL(10, 2) NOT NULL,
    `motivo_cancelacion` VARCHAR(500) NULL,
    `mascota_id` VARCHAR(191) NOT NULL,
    `veterinario_id` VARCHAR(191) NOT NULL,
    `creado_en` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `actualizado_en` DATETIME(3) NOT NULL,

    INDEX `citas_mascota_id_idx`(`mascota_id`),
    INDEX `citas_veterinario_id_fecha_hora_idx`(`veterinario_id`, `fecha`, `hora`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `citas_servicios` (
    `cita_id` VARCHAR(191) NOT NULL,
    `servicio_id` VARCHAR(191) NOT NULL,
    `precio_aplicado` DECIMAL(10, 2) NOT NULL,

    INDEX `citas_servicios_servicio_id_idx`(`servicio_id`),
    PRIMARY KEY (`cita_id`, `servicio_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `pagos` (
    `id` VARCHAR(191) NOT NULL,
    `metodo` ENUM('EFECTIVO', 'TARJETA', 'TRANSFERENCIA') NOT NULL,
    `referencia` VARCHAR(191) NULL,
    `monto` DECIMAL(10, 2) NOT NULL,
    `fecha_pago` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `cita_id` VARCHAR(191) NOT NULL,
    `creado_en` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `pagos_cita_id_key`(`cita_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `mascotas` ADD CONSTRAINT `mascotas_cliente_id_fkey` FOREIGN KEY (`cliente_id`) REFERENCES `usuarios`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `citas` ADD CONSTRAINT `citas_mascota_id_fkey` FOREIGN KEY (`mascota_id`) REFERENCES `mascotas`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `citas` ADD CONSTRAINT `citas_veterinario_id_fkey` FOREIGN KEY (`veterinario_id`) REFERENCES `usuarios`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `citas_servicios` ADD CONSTRAINT `citas_servicios_cita_id_fkey` FOREIGN KEY (`cita_id`) REFERENCES `citas`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `citas_servicios` ADD CONSTRAINT `citas_servicios_servicio_id_fkey` FOREIGN KEY (`servicio_id`) REFERENCES `servicios`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `pagos` ADD CONSTRAINT `pagos_cita_id_fkey` FOREIGN KEY (`cita_id`) REFERENCES `citas`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
