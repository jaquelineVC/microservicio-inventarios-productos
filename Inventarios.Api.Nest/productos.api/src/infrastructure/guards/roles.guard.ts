import {
  Injectable, CanActivate, ExecutionContext, ForbiddenException
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';

export const ROLES_KEY = 'roles';

/**
 * Guard que verifica el rol del usuario autenticado.
 * Se usa junto con el decorador @Roles()
 */
@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<string[]>(
      ROLES_KEY,
      [context.getHandler(), context.getClass()],
    );

    if (!requiredRoles || requiredRoles.length === 0)
      return true;

    const { user } = context.switchToHttp().getRequest();

    if (!user)
      throw new ForbiddenException('No autorizado.');

    const hasRole = requiredRoles.includes(user.role);
    if (!hasRole)
      throw new ForbiddenException('No tienes permisos para realizar esta acción.');

    return true;
  }
}