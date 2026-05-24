import { Body, Controller, Get, Param, ParseUUIDPipe, Post, Put, Req, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../autenticacion/guards/jwt-auth.guard';
import { RolesGuard } from '../autenticacion/guards/roles.guard';
import { ClientesService } from './clientes.service';
import { CrearClienteDto } from './dto/crear-cliente.dto';
import { Roles } from '../autenticacion/decoradores/roles.decorador';
import { ActualizarClienteDto } from './dto/actualizar-cliente.dto';
import { RequestConUsuario } from '../autenticacion/interfaces/request-con-usuario.interface';

@Controller('clientes')
export class ClientesController {
    constructor(private readonly clientesService: ClientesService) {}

    /**
     * 
     * Crear un cliente
     */
    @Post()
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles('RECEPCIONISTA')
    crearCliente(@Body() dto: CrearClienteDto) {
        return this.clientesService.crearCliente(dto);
    }

    /**
    * Listar clientes
    */
    @Get()
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles('RECEPCIONISTA', 'ADMIN')
    listarClientes() {
        return this.clientesService.listarClientes();
    }

    /**
     * Actualizar cliente
    */
    @Put(':clienteId')
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles('RECEPCIONISTA')
    actualizarCliente(@Param('clienteId', ParseUUIDPipe)clienteId: string,@Body() dto: ActualizarClienteDto,) {
    return this.clientesService.actualizarCliente(
        clienteId,
        dto,
    );
    }

    /**
     * Obtener cliente por ID
     */
    @Get(':clienteId')
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles('RECEPCIONISTA', 'ADMIN', 'CLIENTE')
    obtenerCliente(@Param('clienteId', ParseUUIDPipe)clienteId: string,@Req()request: RequestConUsuario,) {
        return this.clientesService.obtenerClientePorId(
            clienteId,
            request.usuario,
        );
    }
}
