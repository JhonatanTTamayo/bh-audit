-- Tabla de productos del inventario (medicamentos, vacunas e insumos quirúrgicos)
CREATE TABLE `inventario` (
    `id`              VARCHAR(36)  NOT NULL,
    `nombre`          VARCHAR(150) NOT NULL,
    `tipo`            ENUM('MEDICAMENTO', 'VACUNA', 'INSUMO_QUIRURGICO') NOT NULL,
    `stock`           INT          NOT NULL DEFAULT 0,
    `stock_minimo`    INT          NOT NULL DEFAULT 0,
    `precio`          DECIMAL(12, 2) NOT NULL,
    `fecha_vencimiento` DATE       NOT NULL,
    `activo`          BOOLEAN      NOT NULL DEFAULT true,
    `creado_en`       DATETIME(3)  NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `actualizado_en`  DATETIME(3)  NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;