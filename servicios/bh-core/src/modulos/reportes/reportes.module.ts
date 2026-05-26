import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';

import { ReportesController } from './reportes.controller';
import { ReportesService } from './reportes.service';

@Module({
  imports: [HttpModule],

  controllers: [ReportesController],

  providers: [ReportesService],
})
/**
 * Modulo que agrupa la generacion de reportes.
 *
 * @class ReportesModule
 */
export class ReportesModule {}
