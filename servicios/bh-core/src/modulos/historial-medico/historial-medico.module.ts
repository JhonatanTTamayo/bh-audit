import { Module } from '@nestjs/common';

import { HistorialMedicoController }
from './historial-medico.controller';

import { HistorialMedicoService }
from './historial-medico.service';

import { InventarioModule }
from '../inventario/inventario.module';

@Module({
  imports: [
    InventarioModule,
  ],

  controllers: [
    HistorialMedicoController,
  ],

  providers: [
    HistorialMedicoService,
  ],
})
export class HistorialMedicoModule {}