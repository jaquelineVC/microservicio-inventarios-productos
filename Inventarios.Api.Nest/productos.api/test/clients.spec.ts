import request from 'supertest';
import { INestApplication } from '@nestjs/common';
import { createTestApp, closeTestApp } from './test-app.factory';
import { getAdminToken } from './auth.helper';

describe('ClientsController (e2e)', () => {
  let app: INestApplication;
  let adminToken: string;

  beforeAll(async () => {
    app = await createTestApp();
    adminToken = await getAdminToken(app);
  },60000);

  afterAll(async () => {
    await closeTestApp();
  });

  describe('GET /api/clients', () => {

    it('GetAll_Ok — obtiene lista de clientes', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/clients')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(Array.isArray(response.body.data)).toBe(true);
    });

    it('GetAll_Fail_NoToken — sin token devuelve 401', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/clients');

      expect(response.status).toBe(401);
    });

  });

  describe('POST /api/clients', () => {

    it('Create_Ok — crea cliente exitosamente', async () => {
      const response = await request(app.getHttpServer())
        .post('/api/clients')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          name: `Cliente Test ${Date.now()}`,
          email: `cliente.${Date.now()}@test.com`,
          phone: '6181234567',
          address: 'Dirección de prueba',
        });

      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
    });

    it('Create_Fail_EmailInvalido — email inválido devuelve 400', async () => {
      const response = await request(app.getHttpServer())
        .post('/api/clients')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          name: 'Cliente Test',
          email: 'emailinvalido',
          phone: '6181234567',
        });

      expect(response.status).toBe(400);
    });

    it('Create_Fail_EmailDuplicado — email duplicado devuelve error', async () => {
      const email = `dup.cliente.${Date.now()}@test.com`;

      await request(app.getHttpServer())
        .post('/api/clients')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ name: 'Cliente 1', email, phone: '6181234567' });

      const response = await request(app.getHttpServer())
        .post('/api/clients')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ name: 'Cliente 2', email, phone: '6181234567' });

      expect(response.body.success).toBe(false);
    });

    it('Create_Fail_NoToken — sin token devuelve 401', async () => {
      const response = await request(app.getHttpServer())
        .post('/api/clients')
        .send({ name: 'Test', email: 'test@test.com' });

      expect(response.status).toBe(401);
    });

  });
});