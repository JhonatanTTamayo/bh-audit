import { IsNotEmpty, IsString } from 'class-validator';

/**
 * DTO usado para rechazar una cuenta pendiente.
 *
 * @class RechazarCuentaDto
 */
export class RechazarCuentaDto {

  @IsString({message:'El motivo debe ser texto.'})
  @IsNotEmpty({message:'El motivo es obligatorio.'})
  motivo!: string;
}
