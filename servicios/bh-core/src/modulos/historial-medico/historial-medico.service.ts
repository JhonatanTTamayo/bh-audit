import {
  Injectable,
} from '@nestjs/common';

import { InventarioService }
  from '../inventario/inventario.service';

@Injectable()
export class HistorialMedicoService {

  constructor(
    private inventarioService:
      InventarioService,
  ) { }
  async prescribirMedicamento(
    productoId: string,
    cantidad: number,
  ) {

    await this.inventarioService
      .descontarStock(
        productoId,
        cantidad,
      );

    return {
      mensaje:
        'Medicamento prescrito correctamente',
    };

  }


}