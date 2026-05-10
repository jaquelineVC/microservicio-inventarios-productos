import {
  IsNotEmpty, IsString, IsNumber, IsPositive,
  IsUUID, IsOptional, MinLength, MaxLength, Min
} from 'class-validator';

export class CreateProductRequest {
  @IsString()
  @IsNotEmpty({ message: 'El nombre es requerido.' })
  @MinLength(2)
  @MaxLength(150)
  name!: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsNumber()
  @IsPositive({ message: 'El precio debe ser mayor a cero.' })
  price!: number;

  @IsNumber()
  @Min(0, { message: 'El stock no puede ser negativo.' })
  stock!: number;

  @IsString()
  @IsNotEmpty({ message: 'El SKU es requerido.' })
  sku!: string;

  @IsString()
  @IsOptional()
  imageUrl?: string;

  @IsUUID()
  @IsNotEmpty({ message: 'La categoría es requerida.' })
  categoryId!: string;

  @IsUUID()
  @IsNotEmpty({ message: 'El proveedor es requerido.' })
  supplierId!: string;
}