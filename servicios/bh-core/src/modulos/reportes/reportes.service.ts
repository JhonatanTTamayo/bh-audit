import { Injectable } from '@nestjs/common';

import { FiltroTrazabilidadDto } from './dto/filtro-trazabilidad.dto';

@Injectable()
export class ReportesService {

  /**
   * Obtiene los datos usados para generar el reporte PDF de trazabilidad.
   *
   * Actualmente retorna datos simulados mientras se completa la integracion
   * con el microservicio bh-audit.
   *
   * @param filtros Rango de fechas y filtros opcionales.
   * @returns Acciones de auditoria usadas para generar el PDF.
   */
  async obtenerReporteTrazabilidad(
    filtros: FiltroTrazabilidadDto,
  ) {

    /* este codigo sirve para  vereficar que si este funcionando el endpoint y que el pdf se este generando con datos simulados ya que el bh-audit no tiene nada aun*/
    return [
      {
        usuario: 'admin@bh.com',
        rol: 'ADMINISTRADOR',
        accion: 'CREACION_CITA',
        modulo: 'CITAS',
        fecha: 'Tue May 05 2026 12:25:09 GMT-0500 (hora estándar de Colombia)',
      },
      {
        usuario: 'recepcion@bh.com',
        rol: 'RECEPCIONISTA',
        accion: 'ANULACION_FACTURA',
        modulo: 'FACTURACION',
        fecha: 'Wed May 20 2026 09:45:09 GMT-0500 (hora estándar de Colombia)',
      },
      {
        usuario: 'vet@bh.com',
        rol: 'VETERINARIO',
        accion: 'CREACION_HISTORIAL',
        modulo: 'HISTORIAL_MEDICO',
        fecha: new Date(),
      },
    ];
  }
}
