import request from 'supertest';
import { INestApplication } from '@nestjs/common';

export async function getAdminToken(app: INestApplication): Promise<string> {
  const response = await request(app.getHttpServer())
    .post('/api/auth/login')
    .send({
      email: 'admin@productos.com',
      password: 'Admin@1234',
    });

  if (!response.body?.data?.token)
    throw new Error(
      `No se pudo obtener token. Status: ${response.status}. Body: ${JSON.stringify(response.body)}`,
    );

  return response.body.data.token;
}

export async function getEmpleadoToken(
  app: INestApplication,
  email: string,
  password: string,
): Promise<string> {
  const response = await request(app.getHttpServer())
    .post('/api/auth/login')
    .send({ email, password });

  if (!response.body?.data?.token)
    throw new Error('No se pudo obtener token de empleado.');

  return response.body.data.token;
}