import { Body, Controller, Get, Param, ParseUUIDPipe, Post, Put, Req, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../autenticacion/guards/jwt-auth.guard';
import { RolesGuard } from '../autenticacion/guards/roles.guard';
import { ClientesService } from './clientes.service';
import { CrearClienteDto } from './dto/crear-cliente.dto';
import { Roles } from '../autenticacion/decoradores/roles.decorador';
import { ActualizarClienteDto } from './dto/actualizar-cliente.dto';
import { RequestConUsuario } from '../autenticacion/interfaces/request-con-usuario.interface';

/**
 * Controlador encargado de exponer endpoints de clientes.
 *
 * @class ClientesController
 */
@Controller('clientes')
export class ClientesController {
    constructor(private readonly clientesService: ClientesService) {}

    /**
     * Crea un cliente desde el rol recepcionista.
     *
     * @param dto Datos requeridos para crear el cliente.
     * @returns Cliente creado.
     */
    @Post()
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles('RECEPCIONISTA')
    crearCliente(@Body() dto: CrearClienteDto) {
        return this.clientesService.crearCliente(dto);
    }

    /**
     * Lista todos los clientes registrados.
     *
     * @returns Arreglo de clientes ordenado por fecha de creacion.
     */
    @Get()
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles('RECEPCIONISTA', 'ADMIN')
    listarClientes() {
        return this.clientesService.listarClientes();
    }

    /**
     * Actualiza los datos de un cliente existente.
     *
     * @param clienteId Identificador UUID del cliente.
     * @param dto Datos parciales a actualizar.
     * @returns Cliente actualizado con mensaje de confirmacion.
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
     * Obtiene un cliente por ID respetando las reglas de acceso del rol.
     *
     * @param clienteId Identificador UUID del cliente.
     * @param request Peticion autenticada con los datos del usuario.
     * @returns Datos del cliente solicitado.
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
