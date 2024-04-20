import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { initializeTransactionalContext } from 'typeorm-transactional';
import { AppModule } from './app.module';
import envConfig from './config/env.config';
import 'reflect-metadata';

async function bootstrap() {
    initializeTransactionalContext();
    const app = await NestFactory.create(AppModule);
    app.enableCors({
        origin: ['listener', envConfig().expectedOrigin],
    });
    app.useGlobalPipes(
        new ValidationPipe({
            whitelist: true,
            forbidNonWhitelisted: true,
        })
    );
    await app.listen(envConfig().port, '0.0.0.0');
}
bootstrap();
