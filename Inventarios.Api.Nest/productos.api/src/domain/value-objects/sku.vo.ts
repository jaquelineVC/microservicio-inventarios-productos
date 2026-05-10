import { Result } from '../common/result';

export class SKU {
  private constructor(readonly value: string) {}

  static create(sku: string): Result<SKU> {
    if (!sku || sku.trim().length === 0)
      return Result.failure('El SKU no puede estar vacío.');

    sku = sku.trim().toUpperCase();

    if (sku.length < 3)
      return Result.failure('El SKU debe tener al menos 3 caracteres.');

    if (sku.length > 50)
      return Result.failure('El SKU no puede exceder 50 caracteres.');

    // Solo letras, números y guiones
    const skuRegex = /^[A-Z0-9-]+$/;
    if (!skuRegex.test(sku))
      return Result.failure('El SKU solo puede contener letras, números y guiones.');

    return Result.success(new SKU(sku));
  }

  toString(): string {
    return this.value;
  }

  equals(other: SKU): boolean {
    return this.value === other.value;
  }
}