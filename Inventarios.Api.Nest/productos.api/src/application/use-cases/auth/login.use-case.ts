import { Inject, Injectable } from '@nestjs/common';
import type { IUserRepository } from '../../../domain/interfaces/user.repository.interface';
import { Result } from '../../../domain/common/result';
import { LoginRequest } from '../../../domain/dtos/requests/login.request';
import { AuthResponse } from '../../../domain/dtos/responses/auth.response';

export const HASHER_TOKEN = 'HASHER_TOKEN';
export const JWT_SERVICE_TOKEN = 'JWT_SERVICE_TOKEN';

export interface IPasswordHasher {
  hash(password: string): string;
  verify(password: string, hash: string): boolean;
}

export interface IJwtService {
  generateToken(payload: Record<string, unknown>): string;
}

@Injectable()
export class LoginUseCase {
  constructor(
    @Inject('IUserRepository')
    private readonly userRepository: IUserRepository,
    @Inject(HASHER_TOKEN)
    private readonly passwordHasher: IPasswordHasher,
    @Inject(JWT_SERVICE_TOKEN)
    private readonly jwtService: IJwtService,
  ) {}

  async execute(request: LoginRequest): Promise<Result<AuthResponse>> {
    const user = await this.userRepository.findByEmail(request.email);

    if (!user)
      return Result.failure('Credenciales inválidas.');

    if (!user.isActive)
      return Result.failure('La cuenta está desactivada.');

    if (user.isLocked())
      return Result.failure('Cuenta bloqueada temporalmente. Intenta en 15 minutos.');

    const isValid = this.passwordHasher.verify(request.password, user.passwordHash);

    if (!isValid) {
      const updatedUser = user.withFailedLogin();
      await this.userRepository.update(updatedUser);
      return Result.failure('Credenciales inválidas.');
    }

    const updatedUser = user.withSuccessfulLogin();
    await this.userRepository.update(updatedUser);

    const token = this.jwtService.generateToken({
      sub: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
    });

    const expiresAt = new Date(Date.now() + 8 * 60 * 60 * 1000);

    return Result.success(
      new AuthResponse(token, user.name, user.email, user.role, expiresAt),
    );
  }
}