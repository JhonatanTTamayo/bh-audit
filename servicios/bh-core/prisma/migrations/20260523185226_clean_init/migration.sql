/*
  Warnings:

  - You are about to drop the column `actualizado_en` on the `productos` table. All the data in the column will be lost.
  - You are about to drop the column `creado_en` on the `productos` table. All the data in the column will be lost.
  - Added the required column `actualizadoEn` to the `productos` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `productos` DROP COLUMN `actualizado_en`,
    DROP COLUMN `creado_en`,
    ADD COLUMN `actualizadoEn` DATETIME(3) NOT NULL,
    ADD COLUMN `creadoEn` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3);

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
    `fecha` DATETIME(3) NOT NULL,
    `hora` VARCHAR(191) NOT NULL,
    `estado` ENUM('CONFIRMADA', 'FINALIZADA', 'CANCELADA') NOT NULL DEFAULT 'CONFIRMADA',
    `monto_total` DECIMAL(10, 2) NOT NULL,
    `motivo_cancelacion` VARCHAR(191) NULL,
    `mascotaId` VARCHAR(191) NOT NULL,
    `veterinarioId` VARCHAR(191) NOT NULL,
    `creadoEn` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `citas_servicios` (
    `citaId` VARCHAR(191) NOT NULL,
    `servicioId` VARCHAR(191) NOT NULL,
    `precioAplicado` DECIMAL(10, 2) NOT NULL,

    PRIMARY KEY (`citaId`, `servicioId`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `pagos` (
    `id` VARCHAR(191) NOT NULL,
    `metodo` ENUM('EFECTIVO', 'TARJETA', 'TRANSFERENCIA') NOT NULL,
    `referencia` VARCHAR(191) NULL,
    `monto` DECIMAL(10, 2) NOT NULL,
    `fechaPago` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `citaId` VARCHAR(191) NOT NULL,
    `creadoEn` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `pagos_citaId_key`(`citaId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `mascotas` ADD CONSTRAINT `mascotas_cliente_id_fkey` FOREIGN KEY (`cliente_id`) REFERENCES `usuarios`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `citas` ADD CONSTRAINT `citas_mascotaId_fkey` FOREIGN KEY (`mascotaId`) REFERENCES `mascotas`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `citas` ADD CONSTRAINT `citas_veterinarioId_fkey` FOREIGN KEY (`veterinarioId`) REFERENCES `usuarios`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `citas_servicios` ADD CONSTRAINT `citas_servicios_citaId_fkey` FOREIGN KEY (`citaId`) REFERENCES `citas`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `citas_servicios` ADD CONSTRAINT `citas_servicios_servicioId_fkey` FOREIGN KEY (`servicioId`) REFERENCES `servicios`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `pagos` ADD CONSTRAINT `pagos_citaId_fkey` FOREIGN KEY (`citaId`) REFERENCES `citas`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
