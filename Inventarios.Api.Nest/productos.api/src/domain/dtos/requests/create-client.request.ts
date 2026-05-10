import {
  IsEmail, IsNotEmpty, IsOptional,
  IsString, MinLength, MaxLength
} from 'class-validator';

export class CreateClientRequest {
  @IsString()
  @IsNotEmpty({ message: 'El nombre del cliente es requerido.' })
  @MinLength(2)
  @MaxLength(150)
  name!: string;

  @IsEmail({}, { message: 'El email del cliente no es válido.' })
  @IsNotEmpty({ message: 'El email es requerido.' })
  email!: string;

  @IsString()
  @IsOptional()
  phone?: string;

  @IsString()
  @IsOptional()
  address?: string;
}