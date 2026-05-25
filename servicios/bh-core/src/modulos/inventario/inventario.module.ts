import { Module } from '@nestjs/common';
import { BasedatosModule } from '../../basedatos/basedatos.module';
import { InventarioController } from './inventario.controller';
import { InventarioService } from './inventario.service';

@Module({
  imports: [BasedatosModule],
  controllers: [InventarioController],
  providers: [InventarioService],

  exports: [InventarioService],
})
/**
 * Modulo que agrupa la gestion de inventario.
 *
 * @class InventarioModule
 */
export class InventarioModule {}
