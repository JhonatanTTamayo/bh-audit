import {IsDateString,IsNumber,IsOptional,IsPositive,IsString,} from 'class-validator';

/**
 * DTO usado para registrar una mascota asociada a un cliente.
 *
 * @class CrearMascotaDto
 */
export class CrearMascotaDto {
  @IsString()
  nombre!: string;

  @IsString()
  especie!: string;

  @IsOptional()
  @IsString()
  raza?: string;

  @IsOptional()
  @IsString()
  color!: string;

  @IsOptional()
  @IsDateString()
  fechaNacimiento!: string;

  @IsOptional()
  @IsNumber()
  @IsPositive()
  peso?: number;
}
