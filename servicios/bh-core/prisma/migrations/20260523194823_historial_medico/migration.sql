/*
  Warnings:

  - You are about to drop the column `actualizadoEn` on the `productos` table. All the data in the column will be lost.
  - You are about to drop the column `creadoEn` on the `productos` table. All the data in the column will be lost.
  - Added the required column `actualizado_en` to the `productos` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `productos` DROP COLUMN `actualizadoEn`,
    DROP COLUMN `creadoEn`,
    ADD COLUMN `actualizado_en` DATETIME(3) NOT NULL,
    ADD COLUMN `creado_en` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3);

-- CreateTable
CREATE TABLE `historiales_medicos` (
    `id` VARCHAR(191) NOT NULL,
    `motivo_consulta` VARCHAR(191) NOT NULL,
    `diagnostico` VARCHAR(191) NOT NULL,
    `tratamiento` VARCHAR(191) NOT NULL,
    `peso_mascota` DECIMAL(10, 2) NOT NULL,
    `fecha_proxima_visita` DATETIME(3) NULL,
    `estado` ENUM('ABIERTO', 'CERRADO') NOT NULL DEFAULT 'CERRADO',
    `mascota_id` VARCHAR(191) NOT NULL,
    `veterinario_id` VARCHAR(191) NOT NULL,
    `creado_en` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `actualizado_en` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `medicamentos_prescritos` (
    `id` VARCHAR(191) NOT NULL,
    `historial_id` VARCHAR(191) NOT NULL,
    `producto_id` VARCHAR(191) NOT NULL,
    `cantidad` INTEGER NOT NULL,
    `creado_en` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `historiales_medicos` ADD CONSTRAINT `historiales_medicos_mascota_id_fkey` FOREIGN KEY (`mascota_id`) REFERENCES `mascotas`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `historiales_medicos` ADD CONSTRAINT `historiales_medicos_veterinario_id_fkey` FOREIGN KEY (`veterinario_id`) REFERENCES `usuarios`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `medicamentos_prescritos` ADD CONSTRAINT `medicamentos_prescritos_historial_id_fkey` FOREIGN KEY (`historial_id`) REFERENCES `historiales_medicos`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `medicamentos_prescritos` ADD CONSTRAINT `medicamentos_prescritos_producto_id_fkey` FOREIGN KEY (`producto_id`) REFERENCES `productos`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
