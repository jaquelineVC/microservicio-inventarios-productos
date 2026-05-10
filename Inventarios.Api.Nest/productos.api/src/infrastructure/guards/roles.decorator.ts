import { SetMetadata } from '@nestjs/common';
import { ROLES_KEY } from './roles.guard';

/**
 * Decorador para especificar roles requeridos en un endpoint.
 * Uso: @Roles('Admin') o @Roles('Admin', 'Empleado')
 */
export const Roles = (...roles: string[]) => SetMetadata(ROLES_KEY, roles);