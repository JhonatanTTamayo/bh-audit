import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service';

/**
 * Controlador raiz de bh-core.
 *
 * @class AppController
 */
@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  /**
   * Retorna un mensaje simple para comprobar que el servicio esta activo.
   *
   * @returns Mensaje de estado del microservicio.
   */
  @Get()
  getHello(): string {
    return this.appService.getHello();
  }
}
