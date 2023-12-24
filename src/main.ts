import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import 'reflect-metadata';
import { initializeTransactionalContext } from 'typeorm-transactional';
import * as dotenv from 'dotenv';
dotenv.config();

async function bootstrap() {
    initializeTransactionalContext();
    const app = await NestFactory.create(AppModule);
    app.enableCors({
        origin: '*',
    });
    app.useGlobalPipes(
        new ValidationPipe({
            whitelist: true,
            forbidNonWhitelisted: true,
        })
    );
    await app.listen(4000, '0.0.0.0');
}
bootstrap();
