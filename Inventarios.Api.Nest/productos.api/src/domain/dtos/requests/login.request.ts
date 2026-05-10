import { IsEmail, IsNotEmpty, IsString, MinLength } from 'class-validator';

export class LoginRequest {
  @IsEmail({}, { message: 'El email no es válido.' })
  @IsNotEmpty({ message: 'El email es requerido.' })
  email!: string;

  @IsString()
  @IsNotEmpty({ message: 'La contraseña es requerida.' })
  @MinLength(8, { message: 'La contraseña debe tener al menos 8 caracteres.' })
  password!: string;
}