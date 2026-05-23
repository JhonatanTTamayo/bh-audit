import {
  Body,
  Controller,
  Post,
} from '@nestjs/common';

import { HistorialMedicoService }
from './historial-medico.service';

import { PrescribirMedicamentoDto }
from './dto/prescribir-medicamento.dto';

@Controller('historial-medico')
export class HistorialMedicoController {

  constructor(
    private historialMedicoService:
      HistorialMedicoService,
  ) {}

  @Post('prescribir')
  prescribir(
    @Body()
    dto: PrescribirMedicamentoDto,
  ) {

    return this.historialMedicoService
      .prescribirMedicamento(
        dto.productoId,
        dto.cantidad,
      );

  }

}