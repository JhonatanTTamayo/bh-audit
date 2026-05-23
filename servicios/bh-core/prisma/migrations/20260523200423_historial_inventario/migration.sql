-- AlterTable
ALTER TABLE `usuarios` ADD COLUMN `motivo_rechazo` VARCHAR(191) NULL;

-- CreateTable
CREATE TABLE `atenciones` (
    `id` VARCHAR(191) NOT NULL,
    `fecha` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `creado_en` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `servicios_atencion` (
    `id` VARCHAR(191) NOT NULL,
    `nombre` VARCHAR(191) NOT NULL,
    `precio` DECIMAL(10, 2) NOT NULL,
    `atencion_id` VARCHAR(191) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `medicamentos_atencion` (
    `id` VARCHAR(191) NOT NULL,
    `nombre` VARCHAR(191) NOT NULL,
    `precio` DECIMAL(10, 2) NOT NULL,
    `cantidad` INTEGER NOT NULL,
    `atencion_id` VARCHAR(191) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `facturas` (
    `id` VARCHAR(191) NOT NULL,
    `atencion_id` VARCHAR(191) NOT NULL,
    `total_facturado` DECIMAL(10, 2) NOT NULL,
    `descuento` DECIMAL(10, 2) NOT NULL DEFAULT 0,
    `estado` ENUM('EMITIDA', 'ANULADA') NOT NULL DEFAULT 'EMITIDA',
    `motivo_anulacion` VARCHAR(191) NULL,
    `creado_en` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `actualizado_en` DATETIME(3) NOT NULL,

    UNIQUE INDEX `facturas_atencion_id_key`(`atencion_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `servicios_atencion` ADD CONSTRAINT `servicios_atencion_atencion_id_fkey` FOREIGN KEY (`atencion_id`) REFERENCES `atenciones`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `medicamentos_atencion` ADD CONSTRAINT `medicamentos_atencion_atencion_id_fkey` FOREIGN KEY (`atencion_id`) REFERENCES `atenciones`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `facturas` ADD CONSTRAINT `facturas_atencion_id_fkey` FOREIGN KEY (`atencion_id`) REFERENCES `atenciones`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
