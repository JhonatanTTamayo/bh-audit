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

-- CreateTable
CREATE TABLE `atenciones` (
    `id` VARCHAR(191) NOT NULL,
    `creado_en` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `actualizado_en` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `facturas` (
    `id` VARCHAR(191) NOT NULL,
    `atencion_id` VARCHAR(191) NOT NULL,
    `metodo_pago` VARCHAR(191) NULL,
    `total_facturado` DECIMAL(10, 2) NOT NULL,
    `descuento` DECIMAL(10, 2) NOT NULL DEFAULT 0,
    `estado` ENUM('EMITIDA', 'ANULADA') NOT NULL DEFAULT 'EMITIDA',
    `motivo_anulacion` VARCHAR(191) NULL,
    `creado_en` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `actualizado_en` DATETIME(3) NOT NULL,

    UNIQUE INDEX `facturas_atencion_id_key`(`atencion_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `vacunas` (
    `id` VARCHAR(191) NOT NULL,
    `nombre` VARCHAR(191) NOT NULL,
    `fecha_aplicacion` DATE NOT NULL,
    `fecha_proxima_dosis` DATE NOT NULL,
    `observaciones` VARCHAR(191) NULL,
    `mascota_id` VARCHAR(191) NOT NULL,
    `historial_id` VARCHAR(191) NULL,
    `producto_id` VARCHAR(191) NULL,
    `veterinario_id` VARCHAR(191) NOT NULL,
    `creado_en` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `vacunas_mascota_id_idx`(`mascota_id`),
    INDEX `vacunas_fecha_proxima_dosis_idx`(`fecha_proxima_dosis`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `_AtencionToServicio` (
    `A` VARCHAR(191) NOT NULL,
    `B` VARCHAR(191) NOT NULL,

    UNIQUE INDEX `_AtencionToServicio_AB_unique`(`A`, `B`),
    INDEX `_AtencionToServicio_B_index`(`B`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `_AtencionToProducto` (
    `A` VARCHAR(191) NOT NULL,
    `B` VARCHAR(191) NOT NULL,

    UNIQUE INDEX `_AtencionToProducto_AB_unique`(`A`, `B`),
    INDEX `_AtencionToProducto_B_index`(`B`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `historiales_medicos` ADD CONSTRAINT `historiales_medicos_mascota_id_fkey` FOREIGN KEY (`mascota_id`) REFERENCES `mascotas`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `historiales_medicos` ADD CONSTRAINT `historiales_medicos_veterinario_id_fkey` FOREIGN KEY (`veterinario_id`) REFERENCES `usuarios`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `medicamentos_prescritos` ADD CONSTRAINT `medicamentos_prescritos_historial_id_fkey` FOREIGN KEY (`historial_id`) REFERENCES `historiales_medicos`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `medicamentos_prescritos` ADD CONSTRAINT `medicamentos_prescritos_producto_id_fkey` FOREIGN KEY (`producto_id`) REFERENCES `productos`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `facturas` ADD CONSTRAINT `facturas_atencion_id_fkey` FOREIGN KEY (`atencion_id`) REFERENCES `atenciones`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `vacunas` ADD CONSTRAINT `vacunas_mascota_id_fkey` FOREIGN KEY (`mascota_id`) REFERENCES `mascotas`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `vacunas` ADD CONSTRAINT `vacunas_historial_id_fkey` FOREIGN KEY (`historial_id`) REFERENCES `historiales_medicos`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `vacunas` ADD CONSTRAINT `vacunas_producto_id_fkey` FOREIGN KEY (`producto_id`) REFERENCES `productos`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `vacunas` ADD CONSTRAINT `vacunas_veterinario_id_fkey` FOREIGN KEY (`veterinario_id`) REFERENCES `usuarios`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `_AtencionToServicio` ADD CONSTRAINT `_AtencionToServicio_A_fkey` FOREIGN KEY (`A`) REFERENCES `atenciones`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `_AtencionToServicio` ADD CONSTRAINT `_AtencionToServicio_B_fkey` FOREIGN KEY (`B`) REFERENCES `servicios`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `_AtencionToProducto` ADD CONSTRAINT `_AtencionToProducto_A_fkey` FOREIGN KEY (`A`) REFERENCES `atenciones`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `_AtencionToProducto` ADD CONSTRAINT `_AtencionToProducto_B_fkey` FOREIGN KEY (`B`) REFERENCES `productos`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
