import { Body, Controller, Param, Patch, Post, UseGuards } from '@nestjs/common';

import { JwtAuthGuard } from '../modulos/autenticacion/guards/jwt-auth.guard';
import { RolesGuard } from '../modulos/autenticacion/guards/roles.guard';
import { Roles } from '../modulos/autenticacion/decoradores/roles.decorador';
import { CrearServicioDto } from './dto/crear-servicio.dto';
import { EditarServicioDto } from './dto/editar-servicio.dto';
import { ServiciosService } from './servicios.service';

/**
 * Controlador para gestionar los servicios de la clínica.
 * Todos los endpoints son exclusivos para administradores.
 *
 * - POST   /admin/servicios              → crear servicio
 * - PATCH  /admin/servicios/:id          → editar servicio
 * - PATCH  /admin/servicios/:id/desactivar → desactivar servicio
 */
@Controller('admin/servicios')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('ADMINISTRADOR')
export class ServiciosController {
    constructor(private readonly serviciosService: ServiciosService) {}

    /**
     * Crea un nuevo servicio.
     */
    @Post()
    async crear(@Body() dto: CrearServicioDto) {
        return this.serviciosService.crear(dto);
    }

    /**
     * Edita un servicio existente.
     */
    @Patch(':id')
    async editar(@Param('id') id: string, @Body() dto: EditarServicioDto) {
        return this.serviciosService.editar(id, dto);
    }

    /**
     * Desactiva un servicio (no lo elimina).
     */
    @Patch(':id/desactivar')
    async desactivar(@Param('id') id: string) {
        return this.serviciosService.desactivar(id);
    }
}