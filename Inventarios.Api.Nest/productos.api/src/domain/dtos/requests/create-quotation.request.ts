import {
  IsArray, IsNotEmpty, IsNumber,
  IsPositive, IsUUID, Min, ValidateNested,
  ArrayMinSize
} from 'class-validator';
import { Type } from 'class-transformer';

export class QuotationItemRequest {
  @IsUUID()
  @IsNotEmpty({ message: 'El producto es requerido.' })
  productId!: string;

  @IsNumber()
  @IsPositive({ message: 'La cantidad debe ser mayor a cero.' })
  quantity!: number;

  @IsNumber()
  @Min(0)
  unitPrice!: number;
}

export class CreateQuotationRequest {
  @IsUUID()
  @IsNotEmpty({ message: 'El cliente es requerido.' })
  clientId!: string;

  @IsArray()
  @ArrayMinSize(1, { message: 'La cotización debe tener al menos un producto.' })
  @ValidateNested({ each: true })
  @Type(() => QuotationItemRequest)
  items!: QuotationItemRequest[];
}