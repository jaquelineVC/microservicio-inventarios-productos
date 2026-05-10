import { Injectable } from '@nestjs/common';
import { JwtService as NestJwtService } from '@nestjs/jwt';
import type { IJwtService } from '../../application/use-cases/auth/login.use-case';

@Injectable()
export class JwtServiceImpl implements IJwtService {
  constructor(private readonly jwtService: NestJwtService) {}

  generateToken(payload: Record<string, unknown>): string {
    return this.jwtService.sign(payload);
  }
}