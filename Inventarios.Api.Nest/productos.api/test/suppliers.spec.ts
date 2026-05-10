import request from 'supertest';
import { INestApplication } from '@nestjs/common';
import { createTestApp, closeTestApp } from './test-app.factory';
import { getAdminToken } from './auth.helper';

describe('SuppliersController (e2e)', () => {
  let app: INestApplication;
  let adminToken: string;

  beforeAll(async () => {
    app = await createTestApp();
    adminToken = await getAdminToken(app);
  },60000);

  afterAll(async () => {
    await closeTestApp();
  });

  describe('GET /api/suppliers', () => {

    it('GetAll_Ok — Admin obtiene lista de proveedores', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/suppliers')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(Array.isArray(response.body.data)).toBe(true);
    });

    it('GetAll_Fail_NoToken — sin token devuelve 401', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/suppliers');

      expect(response.status).toBe(401);
    });

  });

  describe('POST /api/suppliers', () => {

    it('Create_Ok — Admin crea proveedor exitosamente', async () => {
      const response = await request(app.getHttpServer())
        .post('/api/suppliers')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          name: `Proveedor Test ${Date.now()}`,
          phone: '6181234567',
          email: `proveedor.${Date.now()}@test.com`,
          address: 'Dirección de prueba',
        });

      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
    });

    it('Create_Fail_EmailInvalido — email inválido devuelve 400', async () => {
      const response = await request(app.getHttpServer())
        .post('/api/suppliers')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          name: 'Proveedor Test',
          phone: '6181234567',
          email: 'emailinvalido',
          address: 'Test',
        });

      expect(response.status).toBe(400);
    });

    it('Create_Fail_EmailDuplicado — email duplicado devuelve error', async () => {
      const email = `dup.${Date.now()}@test.com`;

      await request(app.getHttpServer())
        .post('/api/suppliers')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ name: 'Proveedor 1', phone: '6181234567', email, address: 'Test' });

      const response = await request(app.getHttpServer())
        .post('/api/suppliers')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ name: 'Proveedor 2', phone: '6181234567', email, address: 'Test' });

      expect(response.body.success).toBe(false);
    });

    it('Create_Fail_NoToken — sin token devuelve 401', async () => {
      const response = await request(app.getHttpServer())
        .post('/api/suppliers')
        .send({ name: 'Test', phone: '6181234567', email: 'test@test.com' });

      expect(response.status).toBe(401);
    });

  });

  describe('DELETE /api/suppliers/:id', () => {

    it('Delete_Ok — Admin elimina proveedor exitosamente', async () => {
      const createResponse = await request(app.getHttpServer())
        .post('/api/suppliers')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          name: `Proveedor Delete ${Date.now()}`,
          phone: '6181234567',
          email: `del.${Date.now()}@test.com`,
          address: 'Test',
        });

      const id = createResponse.body.data;

      const response = await request(app.getHttpServer())
        .delete(`/api/suppliers/${id}`)
        .set('Authorization', `Bearer ${adminToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
    });

    it('Delete_Fail_NotFound — ID inexistente devuelve error', async () => {
      const response = await request(app.getHttpServer())
        .delete('/api/suppliers/id-inexistente')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(response.body.success).toBe(false);
    });

  });
});