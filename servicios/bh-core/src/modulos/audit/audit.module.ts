import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { AuditService } from './audit.service';

/**
 * Módulo interno para comunicar bh-core con bh-audit.
 */
@Module({
  imports: [HttpModule],
  providers: [AuditService],
  exports: [AuditService],
})
/**
 * Modulo que expone el servicio de integracion con bh-audit.
 *
 * @class AuditModule
 */
export class AuditModule {}
