import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  /**
   * Retorna el mensaje base para confirmar que bh-core esta operativo.
   *
   * @returns Mensaje de estado del servicio.
   */
  getHello(): string {
    return 'bh-core funcionando correctamente';
  }
}
