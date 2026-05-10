import request from 'supertest';
import { INestApplication } from '@nestjs/common';
import { createTestApp,closeTestApp } from './test-app.factory';
import { getAdminToken } from './auth.helper';

describe('CategoriesController (e2e)', () => {
  let app: INestApplication;
  let adminToken: string;

  beforeAll(async () => {
    app = await createTestApp();
    adminToken = await getAdminToken(app);
  },60000);

  afterAll(async () => {
    await closeTestApp();
  });

  describe('GET /api/categories', () => {

    it('GetAll_Ok — Admin obtiene lista de categorías', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/categories')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(Array.isArray(response.body.data)).toBe(true);
    });

    it('GetAll_Fail_NoToken — sin token devuelve 401', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/categories');

      expect(response.status).toBe(401);
    });

  });

  describe('POST /api/categories', () => {

    it('Create_Ok — Admin crea categoría exitosamente', async () => {
      const response = await request(app.getHttpServer())
        .post('/api/categories')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          name: `Categoría Test ${Date.now()}`,
          description: 'Descripción de prueba',
        });

      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toBeDefined();
    });

    it('Create_Fail_NombreVacio — nombre vacío devuelve 400', async () => {
      const response = await request(app.getHttpServer())
        .post('/api/categories')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ name: '', description: 'Test' });

      expect(response.status).toBe(400);
    });

    it('Create_Fail_Duplicado — nombre duplicado devuelve error', async () => {
      const name = `Cat Duplicada ${Date.now()}`;

      await request(app.getHttpServer())
        .post('/api/categories')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ name, description: 'Primera' });

      const response = await request(app.getHttpServer())
        .post('/api/categories')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ name, description: 'Segunda' });

      expect(response.body.success).toBe(false);
    });

    it('Create_Fail_NoToken — sin token devuelve 401', async () => {
      const response = await request(app.getHttpServer())
        .post('/api/categories')
        .send({ name: 'Test', description: 'Test' });

      expect(response.status).toBe(401);
    });

  });

  describe('DELETE /api/categories/:id', () => {

    it('Delete_Ok — Admin elimina categoría exitosamente', async () => {
      // Arrange — crear categoría para eliminar
      const createResponse = await request(app.getHttpServer())
        .post('/api/categories')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ name: `Cat Delete ${Date.now()}`, description: 'Test' });

      const id = createResponse.body.data;

      // Act
      const response = await request(app.getHttpServer())
        .delete(`/api/categories/${id}`)
        .set('Authorization', `Bearer ${adminToken}`);

      // Assert
      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
    });

    it('Delete_Fail_NotFound — ID inexistente devuelve error', async () => {
      const response = await request(app.getHttpServer())
        .delete('/api/categories/id-inexistente')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(response.body.success).toBe(false);
    });

    it('Create_Fail_NombreMuyCorto — nombre con 1 caracter devuelve error', async () => {
  const response = await request(app.getHttpServer())
    .post('/api/categories')
    .set('Authorization', `Bearer ${adminToken}`)
    .send({
      name: 'A',
      description: 'Test',
    });

  expect(response.status).toBe(400);
});

  });
});