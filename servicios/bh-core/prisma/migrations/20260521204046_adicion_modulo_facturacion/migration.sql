-- CreateTable
CREATE TABLE `facturas` (
    `id` VARCHAR(191) NOT NULL,
    `atencion_id` VARCHAR(191) NOT NULL,
    `total_facturado` DOUBLE NOT NULL,
    `descuento` DOUBLE NOT NULL DEFAULT 0.0,
    `estado` ENUM('EMITIDA', 'ANULADA') NOT NULL DEFAULT 'EMITIDA',
    `motivo_anulacion` TEXT NULL,
    `creado_en` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `actualizado_en` DATETIME(3) NOT NULL,

    UNIQUE INDEX `facturas_atencion_id_key`(`atencion_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
