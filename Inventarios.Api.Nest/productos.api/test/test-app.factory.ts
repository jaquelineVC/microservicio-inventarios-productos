import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import { getDataSourceToken } from '@nestjs/typeorm';
import { AppModule } from '../src/app.module';
import { seedAdminUser } from './setup/seed';

let app: INestApplication;

export async function createTestApp(): Promise<INestApplication> {
  if (app) return app;

  const moduleFixture: TestingModule = await Test.createTestingModule({
    imports: [AppModule],
  }).compile();

  app = moduleFixture.createNestApplication();

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );
  

  await app.init();

  const dataSource = app.get(getDataSourceToken());
  await seedAdminUser(dataSource);

  return app;
}

export async function closeTestApp(): Promise<void> {
  if (app) {
    await app.close();
    app = undefined as any;
  }
}

