import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Habilita o CORS para permitir requisições do frontend
  app.enableCors({
    origin: 'http://localhost:8081',
    methods: 'GET,POST,PUT,DELETE,OPTIONS,PATCH',
    allowedHeaders: 'Content-Type, Authorization',
  });

  app.useGlobalPipes(new ValidationPipe());
  app.enableShutdownHooks();

  await app.listen(process.env.BACKEND_PORT, () => {
    console.log(
      `⚡ Server is running on http://localhost:${process.env.BACKEND_PORT || 3000}`,
    );
  });
}

bootstrap();
