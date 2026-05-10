import { Injectable, UnauthorizedException } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

/**
 * Guard que verifica el token JWT en cada request.
 * Usa la estrategia 'jwt' registrada en JwtStrategy.
 */
@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  handleRequest(err: any, user: any) {
    if (err || !user)
      throw new UnauthorizedException('Token inválido o expirado.');
    return user;
  }
}