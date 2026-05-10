import request from 'supertest';
import { INestApplication } from '@nestjs/common';
import { createTestApp , closeTestApp} from './test-app.factory';
import { getAdminToken } from './auth.helper';

describe('ProductsController (e2e)', () => {
  let app: INestApplication;
  let adminToken: string;
  let categoryId: string;
  let supplierId: string;

  beforeAll(async () => {
    app = await createTestApp();
    adminToken = await getAdminToken(app);

    // Crear categoría y proveedor para los productos
    const catResponse = await request(app.getHttpServer())
      .post('/api/categories')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ name: `Cat Productos ${Date.now()}`, description: 'Test' });
    categoryId = catResponse.body.data;

    const supResponse = await request(app.getHttpServer())
      .post('/api/suppliers')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        name: `Proveedor Productos ${Date.now()}`,
        phone: '6181234567',
        email: `sup.prod.${Date.now()}@test.com`,
        address: 'Test',
      });
    supplierId = supResponse.body.data;
  },60000);

  afterAll(async () => {
    await closeTestApp();
  });

  const createProductData = () => ({
    name: `Producto Test ${Date.now()}`,
    description: 'Descripción de prueba',
    price: 99.99,
    stock: 10,
    sku: `SKU-${Date.now()}`,
    imageUrl: 'https://test.com/image.jpg',
    categoryId,
    supplierId,
  });

  describe('GET /api/products', () => {

    it('GetAll_Ok — obtiene lista de productos', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/products')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(Array.isArray(response.body.data)).toBe(true);
    });

    it('GetAll_Fail_NoToken — sin token devuelve 401', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/products');

      expect(response.status).toBe(401);
    });
    
    it('GetAll_WithProducts — devuelve lista con productos creados', async () => {
  // Crear un producto para asegurar que la lista no esté vacía
  await request(app.getHttpServer())
    .post('/api/products')
    .set('Authorization', `Bearer ${adminToken}`)
    .send(createProductData());

  const response = await request(app.getHttpServer())
    .get('/api/products')
    .set('Authorization', `Bearer ${adminToken}`);

  expect(response.status).toBe(200);
  expect(response.body.success).toBe(true);
  expect(response.body.data.length).toBeGreaterThan(0);
});

  });

  describe('GET /api/products/search', () => {

    it('Search_Ok — busca productos por nombre', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/products/search?q=Producto')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
    });

    it('Search_Fail_QueryCorta — query menor a 2 chars devuelve error', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/products/search?q=a')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(response.body.success).toBe(false);
    });

  });

  describe('POST /api/products', () => {

    it('Create_Ok — crea producto exitosamente', async () => {
      const response = await request(app.getHttpServer())
        .post('/api/products')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(createProductData());

      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
    });
//CODIGO NUEVO
    it('Create_Fail_ProveedorInexistente — proveedor inexistente devuelve error', async () => {
  const response = await request(app.getHttpServer())
    .post('/api/products')
    .set('Authorization', `Bearer ${adminToken}`)
    .send({ 
      ...createProductData(), 
      supplierId: '00000000-0000-0000-0000-000000000000' 
    });

  expect(response.body.success).toBe(false);
  expect(response.body.message).toContain('proveedor');
});//FIN CODIGO NUEVO

    it('Create_Fail_SkuDuplicado — SKU duplicado devuelve error', async () => {
      const data = createProductData();

      await request(app.getHttpServer())
        .post('/api/products')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(data);

      const response = await request(app.getHttpServer())
        .post('/api/products')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(data);

      expect(response.body.success).toBe(false);
    });

    it('Create_Fail_PrecioNegativo — precio negativo devuelve 400', async () => {
      const response = await request(app.getHttpServer())
        .post('/api/products')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ ...createProductData(), price: -10 });

      expect(response.status).toBe(400);
    });

    it('Create_Fail_CategoriaInexistente — categoría inexistente devuelve error', async () => {
      const response = await request(app.getHttpServer())
        .post('/api/products')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ ...createProductData(), categoryId: '00000000-0000-0000-0000-000000000000' });

      expect(response.body.success).toBe(false);
    });

    it('Create_Fail_NoToken — sin token devuelve 401', async () => {
      const response = await request(app.getHttpServer())
        .post('/api/products')
        .send(createProductData());

      expect(response.status).toBe(401);
    });

  });

  describe('GET /api/products/:id', () => {

    it('GetById_Ok — obtiene producto por ID', async () => {
      const createResponse = await request(app.getHttpServer())
        .post('/api/products')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(createProductData());

      const id = createResponse.body.data;

      const response = await request(app.getHttpServer())
        .get(`/api/products/${id}`)
        .set('Authorization', `Bearer ${adminToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toBeDefined();
    });

    it('GetById_Fail_NotFound — ID inexistente devuelve error', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/products/id-inexistente')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(response.body.success).toBe(false);
    });

  });

  describe('PUT /api/products/:id', () => {

    it('Update_Ok_Admin — Admin actualiza producto exitosamente', async () => {
      const createResponse = await request(app.getHttpServer())
        .post('/api/products')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(createProductData());

      const id = createResponse.body.data;

      const response = await request(app.getHttpServer())
        .put(`/api/products/${id}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ name: 'Producto Actualizado', price: 149.99 });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
    });

    it('Update_Fail_NotFound — ID inexistente devuelve error', async () => {
      const response = await request(app.getHttpServer())
        .put('/api/products/id-inexistente')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ name: 'Test' });

      expect(response.body.success).toBe(false);
    });

    it('Update_Fail_NoToken — sin token devuelve 401', async () => {
      const response = await request(app.getHttpServer())
        .put('/api/products/algún-id')
        .send({ name: 'Test' });

      expect(response.status).toBe(401);
    });

    

  });

  describe('DELETE /api/products/:id', () => {

    it('Delete_Ok — Admin elimina producto exitosamente', async () => {
      const createResponse = await request(app.getHttpServer())
        .post('/api/products')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(createProductData());

      const id = createResponse.body.data;

      const response = await request(app.getHttpServer())
        .delete(`/api/products/${id}`)
        .set('Authorization', `Bearer ${adminToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
    });

    it('Delete_Fail_NotFound — ID inexistente devuelve error', async () => {
      const response = await request(app.getHttpServer())
        .delete('/api/products/id-inexistente')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(response.body.success).toBe(false);
    });

    it('Delete_Fail_NoToken — sin token devuelve 401', async () => {
      const response = await request(app.getHttpServer())
        .delete('/api/products/algún-id');

      expect(response.status).toBe(401);
    });

  });
});