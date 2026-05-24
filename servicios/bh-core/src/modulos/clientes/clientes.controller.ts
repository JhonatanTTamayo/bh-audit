import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../autenticacion/guards/jwt-auth.guard';
import { RolesGuard } from '../autenticacion/guards/roles.guard';
import { ClientesService } from './clientes.service';
import { CrearClienteDto } from './dto/crear-cliente.dto';
import { Roles } from '../autenticacion/decoradores/roles.decorador';

@Controller('clientes')
export class ClientesController {
    constructor(private readonly clientesService: ClientesService) {}

    @Post()
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles('RECEPCIONISTA')
    crearCliente(@Body() dto: CrearClienteDto) {
        return this.clientesService.crearCliente(dto);
    }
}
