import {IsEmail,IsNotEmpty,IsOptional,IsString,MinLength} 
from 'class-validator';

export class CreateAdminDto {
  @IsString({ message: 'El nombre completo debe ser texto.',})
  @IsNotEmpty({message: 'El nombre completo es obligatorio.',})
  nombreCompleto!: string;

  @IsEmail({},{message: 'El correo debe tener formato válido.',},)
  correo!: string;

  @IsOptional()
  @IsString({message: 'El telefono debe ser texto.',})
  telefono?: string;

  @IsString({message: 'La contraseña debe ser texto.',})
  @MinLength(6, {message: 'La contraseña debe tener mínimo 6 caracteres.',})
  contrasena!: string;
}