-- CreateTable
CREATE TABLE `productos` (
    `id` VARCHAR(191) NOT NULL,
    `nombre` VARCHAR(191) NOT NULL,
    `tipo` ENUM('MEDICAMENTO', 'VACUNA', 'INSUMO_QUIRURGICO') NOT NULL,
    `stock` INTEGER NOT NULL,
    `stock_minimo` INTEGER NOT NULL,
    `precio` DECIMAL(10, 2) NOT NULL,
    `fecha_vencimiento` DATETIME(3) NOT NULL,
    `activo` BOOLEAN NOT NULL DEFAULT true,
    `creado_en` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `actualizado_en` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
