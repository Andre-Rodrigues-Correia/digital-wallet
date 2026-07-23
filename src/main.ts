import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

import { SwaggerModule } from '@nestjs/swagger';
import { swaggerConfig } from './confg/swagger/swagger.config';

import { ValidationPipe } from '@nestjs/common';

import helmet from 'helmet';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  const document = SwaggerModule.createDocument(app, swaggerConfig);

  SwaggerModule.setup('docs', app, document);

  app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        transform: true,
        forbidNonWhitelisted: true,
      }),
  );

  app.use(helmet());

  app.enableCors({
    origin: ['http://localhost:3001'],
    credentials: true,
  });

  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
