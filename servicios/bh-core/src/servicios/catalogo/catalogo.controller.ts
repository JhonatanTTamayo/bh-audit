import { Controller, Get, UseGuards } from '@nestjs/common';

import { JwtAuthGuard } from '../../modulos/autenticacion/guards/jwt-auth.guard';
import { RolesGuard } from '../../modulos/autenticacion/guards/roles.guard';
import { Roles } from '../../modulos/autenticacion/decoradores/roles.decorador';
import { CatalogoService } from './catalogo.service';

/**
 * Controlador que expone el catálogo de servicios de la clínica.
 *
 * - GET /catalogo/servicios        → cualquier usuario autenticado (solo activos)
 * - GET /catalogo/servicios/todos  → solo administradores (activos e inactivos)
 */
@Controller('catalogo')
@UseGuards(JwtAuthGuard, RolesGuard)
export class CatalogoController {
    constructor(private readonly catalogoService: CatalogoService) {}

    /**
     * Retorna los servicios activos de la clínica.
     * Accesible por cualquier usuario autenticado.
     */
    @Get('servicios')
    async obtenerServiciosActivos() {
        return this.catalogoService.obtenerServiciosActivos();
    }

    /**
     * Retorna todos los servicios, incluyendo los desactivados.
     * Exclusivo para administradores.
     */
    @Get('servicios/todos')
    @Roles('ADMINISTRADOR')
    async obtenerTodosLosServicios() {
        return this.catalogoService.obtenerTodosLosServicios();
    }
}