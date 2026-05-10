import { RolesGuard, ROLES_KEY } from '../src/infrastructure/guards/roles.guard';
import { ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';

describe('RolesGuard', () => {
  let guard: RolesGuard;
  let reflector: Reflector;

  beforeEach(() => {
    reflector = new Reflector();
    guard = new RolesGuard(reflector);
  });

  const createMockContext = (user: any, requiredRoles?: string[]) => {
    const mockHandler = { name: 'handler' };
    const mockClass = { name: 'class' };

    jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue(requiredRoles);

    return {
      switchToHttp: () => ({
        getRequest: () => ({ user }),
      }),
      getHandler: () => mockHandler,
      getClass: () => mockClass,
    } as any;
  };

  it('should return true when no roles are required', () => {
    const context = createMockContext({ role: 'Admin' }, []);
    expect(guard.canActivate(context)).toBe(true);
  });

  it('should return true when no roles are required (undefined)', () => {
    const context = createMockContext({ role: 'Admin' }, undefined);
    expect(guard.canActivate(context)).toBe(true);
  });

  it('should throw ForbiddenException when user is not present', () => {
    const context = createMockContext(null, ['Admin']);
    expect(() => guard.canActivate(context)).toThrow(ForbiddenException);
    expect(() => guard.canActivate(context)).toThrow('No autorizado');
  });

  it('should throw ForbiddenException when user role is not authorized', () => {
    const context = createMockContext({ role: 'Empleado' }, ['Admin']);
    expect(() => guard.canActivate(context)).toThrow(ForbiddenException);
    expect(() => guard.canActivate(context)).toThrow('No tienes permisos');
  });

  it('should return true when user role matches required role', () => {
    const context = createMockContext({ role: 'Admin' }, ['Admin']);
    expect(guard.canActivate(context)).toBe(true);
  });

  it('should return true when user role matches one of required roles', () => {
    const context = createMockContext({ role: 'Empleado' }, ['Admin', 'Empleado']);
    expect(guard.canActivate(context)).toBe(true);
  });
});