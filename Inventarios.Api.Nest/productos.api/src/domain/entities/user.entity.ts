import { Result } from '../common/result';

export enum UserRole {
  Admin = 'Admin',
  Empleado = 'Empleado',
}

export class UserDomain {
  private constructor(
    readonly id: string,
    readonly name: string,
    readonly email: string,
    readonly passwordHash: string,
    readonly role: UserRole,
    readonly isActive: boolean,
    readonly createdAt: Date,
    readonly failedLoginAttempts: number,
    readonly lockedUntil: Date | null,
    readonly lastLoginAt: Date | null,
  ) {}

  static create(
    name: string,
    email: string,
    passwordHash: string,
    role: UserRole = UserRole.Empleado,
  ): Result<UserDomain> {
    if (!name || name.trim().length < 2)
      return Result.failure('El nombre debe tener al menos 2 caracteres.');

    if (name.trim().length > 100)
      return Result.failure('El nombre no puede exceder 100 caracteres.');

    // Optional chain en lugar de !email || !email.includes('@')
    if (!email?.includes('@'))
      return Result.failure('El email es inválido.');

    return Result.success(
      new UserDomain(
        crypto.randomUUID(),
        name.trim(),
        email.toLowerCase().trim(),
        passwordHash,
        role,
        true,
        new Date(),
        0,
        null,
        null,
      ),
    );
  }

  isLocked(): boolean {
    return this.lockedUntil !== null && this.lockedUntil > new Date();
  }

  withFailedLogin(): UserDomain {
    const attempts = this.failedLoginAttempts + 1;
    const lockedUntil =
      attempts >= 5
        ? new Date(Date.now() + 15 * 60 * 1000)
        : this.lockedUntil;

    return new UserDomain(
      this.id, this.name, this.email, this.passwordHash,
      this.role, this.isActive, this.createdAt,
      attempts, lockedUntil, this.lastLoginAt,
    );
  }

  withSuccessfulLogin(): UserDomain {
    return new UserDomain(
      this.id, this.name, this.email, this.passwordHash,
      this.role, this.isActive, this.createdAt,
      0, null, new Date(),
    );
  }
}