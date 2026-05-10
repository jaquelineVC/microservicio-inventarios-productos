import request from 'supertest';
import { INestApplication } from '@nestjs/common';
import { getRepositoryToken } from '@nestjs/typeorm';
import { createTestApp, closeTestApp } from './test-app.factory';
import { UserOrmEntity } from '../src/infrastructure/database/user.orm-entity';
import * as bcrypt from 'bcrypt';

describe('AuthController (e2e)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    app = await createTestApp();
  }, 60000);

  afterAll(async () => {
    await closeTestApp();
  });

  describe('POST /api/auth/login', () => {

    it('Login_Ok — credenciales válidas devuelven 200 con token', async () => {
      const response = await request(app.getHttpServer())
        .post('/api/auth/login')
        .send({ email: 'admin@productos.com', password: 'Admin@1234' });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.token).toBeDefined();
      expect(response.body.data.role).toBe('Admin');
    });

    it('Login_Fail_WrongPassword — contraseña incorrecta', async () => {
      const response = await request(app.getHttpServer())
        .post('/api/auth/login')
        .send({ email: 'noexiste@productos.com', password: 'Incorrecta@123' });

      expect(response.body.success).toBe(false);
    });

    it('Login_Fail_EmailNotFound — email no registrado', async () => {
      const response = await request(app.getHttpServer())
        .post('/api/auth/login')
        .send({ email: 'noexiste@productos.com', password: 'Admin@1234' });

      expect(response.body.success).toBe(false);
    });

    it('Login_Fail_EmailInvalido — email sin @ devuelve 400', async () => {
      const response = await request(app.getHttpServer())
        .post('/api/auth/login')
        .send({ email: 'emailinvalido', password: 'Admin@1234' });

      expect(response.status).toBe(400);
    });

    it('Login_Fail_AccountInactive — cuenta desactivada', async () => {
      // Arrange — crear usuario inactivo directo en BD
      const repo = app.get(getRepositoryToken(UserOrmEntity));
      const hash = bcrypt.hashSync('Test@1234', 12);
      const user = repo.create({
        id: crypto.randomUUID(),
        name: 'Usuario Inactivo',
        email: `inactivo.${Date.now()}@test.com`,
        passwordHash: hash,
        role: 'Empleado',
        isActive: false,
        failedLoginAttempts: 0,
        lockedUntil: null,
        lastLoginAt: null,
      });
      await repo.save(user);

      // Act
      const response = await request(app.getHttpServer())
        .post('/api/auth/login')
        .send({ email: user.email, password: 'Test@1234' });

      // Assert
      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('desactivada');
    });

    it('Login_Fail_AccountLocked — cuenta bloqueada', async () => {
      // Arrange — crear usuario bloqueado directo en BD
      const repo = app.get(getRepositoryToken(UserOrmEntity));
      const hash = bcrypt.hashSync('Test@1234', 12);
      const lockedUntil = new Date(Date.now() + 15 * 60 * 1000);
      const user = repo.create({
        id: crypto.randomUUID(),
        name: 'Usuario Bloqueado',
        email: `bloqueado.${Date.now()}@test.com`,
        passwordHash: hash,
        role: 'Empleado',
        isActive: true,
        failedLoginAttempts: 5,
        lockedUntil,
        lastLoginAt: null,
      });
      await repo.save(user);

      // Act
      const response = await request(app.getHttpServer())
        .post('/api/auth/login')
        .send({ email: user.email, password: 'Test@1234' });

      // Assert
      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('bloqueada');
    });

    it('Login_Success_ResetsFailedAttempts — login exitoso resetea intentos', async () => {
      // Arrange — usuario con intentos fallidos
      const repo = app.get(getRepositoryToken(UserOrmEntity));
      const hash = bcrypt.hashSync('Test@1234', 12);
      const user = repo.create({
        id: crypto.randomUUID(),
        name: 'Usuario Reset',
        email: `reset.${Date.now()}@test.com`,
        passwordHash: hash,
        role: 'Empleado',
        isActive: true,
        failedLoginAttempts: 3,
        lockedUntil: null,
        lastLoginAt: null,
      });
      await repo.save(user);

      // Act
      const response = await request(app.getHttpServer())
        .post('/api/auth/login')
        .send({ email: user.email, password: 'Test@1234' });

      // Assert
      expect(response.body.success).toBe(true);
      expect(response.body.data.token).toBeDefined();
    });

  });
});