import { DocumentBuilder } from '@nestjs/swagger';

export const swaggerConfig = new DocumentBuilder()
    .setTitle('Digital Wallet API')
    .setDescription('Financial Wallet Challenge')
    .setVersion('1.0')
    .addBearerAuth()
    .build();