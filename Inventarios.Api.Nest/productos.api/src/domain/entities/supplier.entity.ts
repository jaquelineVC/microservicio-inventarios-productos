import { Result } from '../common/result';

export class SupplierDomain {
  private constructor(
    readonly id: string,
    readonly name: string,
    readonly phone: string,
    readonly email: string,
    readonly address: string,
    readonly isActive: boolean,
    readonly createdAt: Date,
  ) {}

  static create(
    name: string,
    phone: string,
    email: string,
    address: string,
  ): Result<SupplierDomain> {
    if (!name || name.trim().length < 2)
      return Result.failure('El nombre del proveedor debe tener al menos 2 caracteres.');

    // Optional chain
    if (!email?.includes('@'))
      return Result.failure('El email del proveedor es inválido.');

    if (!phone || phone.trim().length < 10)
      return Result.failure('El teléfono debe tener al menos 10 caracteres.');

    return Result.success(
      new SupplierDomain(
        crypto.randomUUID(),
        name.trim(),
        phone.trim(),
        email.toLowerCase().trim(),
        address?.trim() ?? '',
        true,
        new Date(),
      ),
    );
  }
}