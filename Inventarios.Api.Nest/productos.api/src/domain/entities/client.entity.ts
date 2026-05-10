import { Result } from '../common/result';

export class ClientDomain {
  private constructor(
    readonly id: string,
    readonly name: string,
    readonly email: string,
    readonly phone: string,
    readonly address: string,
    readonly createdAt: Date,
  ) {}

  static create(
    name: string,
    email: string,
    phone: string,
    address: string,
  ): Result<ClientDomain> {
    if (!name || name.trim().length < 2)
      return Result.failure('El nombre del cliente debe tener al menos 2 caracteres.');

    // Optional chain
    if (!email?.includes('@'))
      return Result.failure('El email del cliente es inválido.');

    return Result.success(
      new ClientDomain(
        crypto.randomUUID(),
        name.trim(),
        email.toLowerCase().trim(),
        phone?.trim() ?? '',
        address?.trim() ?? '',
        new Date(),
      ),
    );
  }
}