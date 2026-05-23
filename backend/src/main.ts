import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import * as express from 'express';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Configurar limite de tamanho para requisições (100MB)
  app.use(express.json({ limit: '100mb' }));
  app.use(express.urlencoded({ extended: true, limit: '100mb' }));

  // Habilita o CORS para permitir requisições do frontend
  app.enableCors({
    origin: 'http://localhost:8081',
    methods: 'GET,POST,PUT,DELETE,OPTIONS,PATCH',
    allowedHeaders: 'Content-Type, Authorization',
  });

  app.useGlobalPipes(new ValidationPipe());
  app.enableShutdownHooks();

  await app.listen(process.env.BACKEND_PORT, '0.0.0.0', () => {
    console.log(`⚡ Server is running on http://localhost:${process.env.BACKEND_PORT || 3000}`);
  });
}

bootstrap();
