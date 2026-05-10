import { IsNotEmpty, IsOptional, IsString, MinLength, MaxLength } from 'class-validator';

export class CreateCategoryRequest {
  @IsString()
  @IsNotEmpty({ message: 'El nombre de la categoría es requerido.' })
  @MinLength(2)
  @MaxLength(100)
  name!: string;

  @IsString()
  @IsOptional()
  description?: string;
}