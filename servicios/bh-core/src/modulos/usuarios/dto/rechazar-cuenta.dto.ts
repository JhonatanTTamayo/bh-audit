import { IsNotEmpty, IsString } from 'class-validator';

export class RechazarCuentaDto {

  @IsString({message:'El motivo debe ser texto.'})
  @IsNotEmpty({message:'El motivo es obligatorio.'})
  motivo!: string;
}