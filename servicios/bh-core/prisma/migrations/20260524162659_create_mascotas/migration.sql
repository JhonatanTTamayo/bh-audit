-- CreateTable
CREATE TABLE `mascotas` (
    `id` VARCHAR(191) NOT NULL,
    `nombre` VARCHAR(191) NOT NULL,
    `especie` VARCHAR(191) NOT NULL,
    `raza` VARCHAR(191) NULL,
    `color` VARCHAR(191) NOT NULL,
    `fecha_nacimiento` DATETIME(3) NOT NULL,
    `peso` DECIMAL(10, 2) NOT NULL,
    `estado` ENUM('ACTIVA', 'HOSPITALIZADA', 'FALLECIDA') NOT NULL DEFAULT 'ACTIVA',
    `cliente_id` VARCHAR(191) NOT NULL,
    `creado_en` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `actualizado_en` DATETIME(3) NOT NULL,

    INDEX `mascotas_cliente_id_idx`(`cliente_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `mascotas` ADD CONSTRAINT `mascotas_cliente_id_fkey` FOREIGN KEY (`cliente_id`) REFERENCES `clientes`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
