import request from 'supertest';
import { INestApplication } from '@nestjs/common';
import { getAdminToken } from './auth.helper';
import { createTestApp, closeTestApp } from './test-app.factory';

describe('QuotationsController (e2e)', () => {
  let app: INestApplication;
  let adminToken: string;
  let clientId: string;
  let productId: string;

  beforeAll(async () => {
    app = await createTestApp();
    adminToken = await getAdminToken(app);

    // Crear datos necesarios para cotizaciones
    const catResponse = await request(app.getHttpServer())
      .post('/api/categories')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ name: `Cat Quot ${Date.now()}`, description: 'Test' });

    const supResponse = await request(app.getHttpServer())
      .post('/api/suppliers')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        name: `Sup Quot ${Date.now()}`,
        phone: '6181234567',
        email: `sup.quot.${Date.now()}@test.com`,
        address: 'Test',
      });

    const prodResponse = await request(app.getHttpServer())
      .post('/api/products')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        name: `Prod Quot ${Date.now()}`,
        description: 'Test',
        price: 100,
        stock: 50,
        sku: `SKU-QUOT-${Date.now()}`,
        imageUrl: '',
        categoryId: catResponse.body.data,
        supplierId: supResponse.body.data,
      });
    productId = prodResponse.body.data;

    const clientResponse = await request(app.getHttpServer())
      .post('/api/clients')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        name: `Cliente Quot ${Date.now()}`,
        email: `client.quot.${Date.now()}@test.com`,
        phone: '6181234567',
      });
    clientId = clientResponse.body.data;
  } ,60000);

  afterAll(async () => {
    await closeTestApp();
  });

  const createQuotationData = () => ({
    clientId,
    items: [
      {
        productId,
        quantity: 2,
        unitPrice: 100,
      },
    ],
  });

  describe('POST /api/quotations', () => {

    it('Create_Ok — crea cotización exitosamente', async () => {
      const response = await request(app.getHttpServer())
        .post('/api/quotations')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(createQuotationData());

      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
    });
//CODIGO NUEVO: Agrego test para producto inexistente y cliente inexistente
    it('Create_Fail_ProductoInexistente — producto inexistente devuelve error', async () => {
  const response = await request(app.getHttpServer())
    .post('/api/quotations')
    .set('Authorization', `Bearer ${adminToken}`)
    .send({
      clientId,
      items: [
        {
          productId: '00000000-0000-0000-0000-000000000000',
          quantity: 1,
          unitPrice: 100,
        },
      ],
    });

  expect(response.body.success).toBe(false);
  expect(response.body.message).toContain('Producto');
});//FIN CODIGO NUEVO

    it('Create_Fail_ClienteInexistente — cliente inexistente devuelve error', async () => {
      const response = await request(app.getHttpServer())
        .post('/api/quotations')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          clientId: '00000000-0000-0000-0000-000000000000',
          items: [{ productId, quantity: 1, unitPrice: 100 }],
        });

      expect(response.body.success).toBe(false);
    });

    it('Create_Fail_SinItems — sin items devuelve 400', async () => {
      const response = await request(app.getHttpServer())
        .post('/api/quotations')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ clientId, items: [] });

      expect(response.status).toBe(400);
    });

    it('Create_Fail_NoToken — sin token devuelve 401', async () => {
      const response = await request(app.getHttpServer())
        .post('/api/quotations')
        .send(createQuotationData());

      expect(response.status).toBe(401);
    });

  });

  describe('GET /api/quotations', () => {

    it('GetAll_Ok_Admin — Admin obtiene todas las cotizaciones', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/quotations')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(Array.isArray(response.body.data)).toBe(true);
    });

    it('GetAll_Fail_NoToken — sin token devuelve 401', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/quotations');

      expect(response.status).toBe(401);
    });

  });

  describe('GET /api/quotations/my', () => {

    it('GetMy_Ok — obtiene cotizaciones propias', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/quotations/my')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
    });

  });

  describe('PATCH /api/quotations/:id/approve', () => {

    it('Approve_Ok — Admin aprueba cotización pendiente', async () => {
      const createResponse = await request(app.getHttpServer())
        .post('/api/quotations')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(createQuotationData());

      const id = createResponse.body.data;

      const response = await request(app.getHttpServer())
        .patch(`/api/quotations/${id}/approve`)
        .set('Authorization', `Bearer ${adminToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
    });
//CODIGO NUEVO: Agrego test para rechazar cotización ya rechazada
    it('Reject_Fail_YaRechazada — cotización ya rechazada devuelve error', async () => {
  // Crear cotización
  const createResponse = await request(app.getHttpServer())
    .post('/api/quotations')
    .set('Authorization', `Bearer ${adminToken}`)
    .send(createQuotationData());

  const id = createResponse.body.data;

  // Rechazar
  await request(app.getHttpServer())
    .patch(`/api/quotations/${id}/reject`)
    .set('Authorization', `Bearer ${adminToken}`);

  // Intentar rechazar nuevamente
  const response = await request(app.getHttpServer())
    .patch(`/api/quotations/${id}/reject`)
    .set('Authorization', `Bearer ${adminToken}`);

  expect(response.body.success).toBe(false);
});//FIN CODIGO NUEVO

    it('Approve_Fail_NotFound — ID inexistente devuelve error', async () => {
      const response = await request(app.getHttpServer())
        .patch('/api/quotations/id-inexistente/approve')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(response.body.success).toBe(false);
    });

    it('Approve_Fail_YaAprobada — cotización ya aprobada devuelve error', async () => {
      const createResponse = await request(app.getHttpServer())
        .post('/api/quotations')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(createQuotationData());

      const id = createResponse.body.data;

      await request(app.getHttpServer())
        .patch(`/api/quotations/${id}/approve`)
        .set('Authorization', `Bearer ${adminToken}`);

      const response = await request(app.getHttpServer())
        .patch(`/api/quotations/${id}/approve`)
        .set('Authorization', `Bearer ${adminToken}`);

      expect(response.body.success).toBe(false);
    });

  });

  describe('PATCH /api/quotations/:id/reject', () => {

    it('Reject_Ok — Admin rechaza cotización pendiente', async () => {
      const createResponse = await request(app.getHttpServer())
        .post('/api/quotations')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(createQuotationData());

      const id = createResponse.body.data;

      const response = await request(app.getHttpServer())
        .patch(`/api/quotations/${id}/reject`)
        .set('Authorization', `Bearer ${adminToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
    });

    it('Reject_Fail_NotFound — ID inexistente devuelve error', async () => {
      const response = await request(app.getHttpServer())
        .patch('/api/quotations/id-inexistente/reject')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(response.body.success).toBe(false);
    });

  });

  describe('DELETE /api/quotations/:id', () => {

    it('Delete_Ok — Admin elimina cotización exitosamente', async () => {
      const createResponse = await request(app.getHttpServer())
        .post('/api/quotations')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(createQuotationData());

      const id = createResponse.body.data;

      const response = await request(app.getHttpServer())
        .delete(`/api/quotations/${id}`)
        .set('Authorization', `Bearer ${adminToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
    });

    it('Delete_Fail_NotFound — ID inexistente devuelve error', async () => {
      const response = await request(app.getHttpServer())
        .delete('/api/quotations/id-inexistente')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(response.body.success).toBe(false);
    });

    it('Delete_Fail_NoToken — sin token devuelve 401', async () => {
      const response = await request(app.getHttpServer())
        .delete('/api/quotations/algún-id');

      expect(response.status).toBe(401);
    });

  });
});