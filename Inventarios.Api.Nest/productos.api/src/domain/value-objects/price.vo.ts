import { Result } from '../common/result';

export class Price {
  private constructor(readonly value: number) {}

  static create(value: number): Result<Price> {
    if (value === undefined || value === null)
      return Result.failure('El precio no puede estar vacío.');

    if (Number.isNaN(value))
      return Result.failure('El precio debe ser un número válido.');

    if (value < 0)
      return Result.failure('El precio no puede ser negativo.');

    if (value > 999999.99)
      return Result.failure('El precio excede el máximo permitido.');

    return Result.success(new Price(Number(value.toFixed(2))));
  }

  toString(): string {
    return this.value.toFixed(2);
  }

  equals(other: Price): boolean {
    return this.value === other.value;
  }
}