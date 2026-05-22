import {IsInt,IsNumber,IsOptional,IsPositive,IsString,Min,} from 'class-validator';

export class CrearMascotaDto {
  @IsString()
  nombre!: string;

  @IsString()
  especie!: string;

  @IsOptional()
  @IsString()
  raza?: string;

  @IsOptional()
  @IsInt()
  @Min(0)
  edad?: number;

  @IsOptional()
  @IsNumber()
  @IsPositive()
  peso?: number;
}