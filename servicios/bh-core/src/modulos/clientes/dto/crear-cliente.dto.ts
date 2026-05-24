import {IsEmail,IsNotEmpty,IsString,} from 'class-validator';

export class CrearClienteDto {
  @IsString()
  @IsNotEmpty()
  nombre!: string;

  @IsString()
  @IsNotEmpty()
  apellido!: string;

  @IsEmail()
  @IsNotEmpty()
  email!: string;

  @IsString()
  @IsNotEmpty()
  telefono!: string;

  @IsString()
  @IsNotEmpty()
  documento!: string;

  @IsString()
  @IsNotEmpty()
  direccion!: string;
}