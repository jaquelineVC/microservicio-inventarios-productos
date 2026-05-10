import {
  IsEmail, IsNotEmpty, IsOptional,
  IsString, MinLength, MaxLength
} from 'class-validator';

export class CreateSupplierRequest {
  @IsString()
  @IsNotEmpty({ message: 'El nombre del proveedor es requerido.' })
  @MinLength(2)
  @MaxLength(150)
  name!: string;

  @IsString()
  @IsNotEmpty({ message: 'El teléfono es requerido.' })
  @MinLength(10)
  phone!: string;

  @IsEmail({}, { message: 'El email del proveedor no es válido.' })
  @IsNotEmpty({ message: 'El email es requerido.' })
  email!: string;

  @IsString()
  @IsOptional()
  address?: string;
}