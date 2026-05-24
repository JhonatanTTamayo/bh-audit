import { Injectable } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';

import { FiltroTrazabilidadDto } from './dto/filtro-trazabilidad.dto';

@Injectable()
export class ReportesService {

  constructor(
    private readonly httpService: HttpService,
  ) {}

  async obtenerReporteTrazabilidad(
    filtros: FiltroTrazabilidadDto,
  ) {

    const respuesta = await firstValueFrom(
      this.httpService.get(
        'http://bh-audit:3001/auditoria',
        {
          params: filtros,
        },
      ),
    );

    return respuesta.data;
  }
}