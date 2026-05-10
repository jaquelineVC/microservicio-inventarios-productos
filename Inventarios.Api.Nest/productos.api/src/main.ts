import { NestFactory} from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';
import helmet from 'helmet';
import { LoggingInterceptor } from './infrastructure/interceptors/logging.interceptor';
import { GlobalExceptionFilter } from './infrastructure/filters/global-exception.filter';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    logger: ['error', 'warn', 'log', 'debug'],
  });

  // ── Cross Cutting: Seguridad HTTP 
  app.use(helmet());

  // ── Cross Cutting: Filtro de excepciones global 
  app.useGlobalFilters(new GlobalExceptionFilter());

  // ── Cross Cutting: Interceptor de logging 
  app.useGlobalInterceptors(new LoggingInterceptor());

  // ── Cross Cutting: Validación global de DTOs 
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  // ── CORS 
  app.enableCors({
    origin: ['http://localhost:4200', 'http://localhost:3000'],
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  });

  const port = process.env.PORT ?? 3001;
  await app.listen(port);
  console.log(`🚀 Productos API corriendo en http://localhost:${port}`);
}

bootstrap();