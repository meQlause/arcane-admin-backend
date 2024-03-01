import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtModule } from '@nestjs/jwt';
import { RolaChallenge } from 'src/entities/rola-challenge/rola-challenge.entity';
import { Address } from 'src/entities/arcane/address.entity';
import { RolaController } from './rola.controller';
import { RolaService } from './rola.service';

@Module({
    imports: [
        TypeOrmModule.forFeature([RolaChallenge], 'rola-challenge-connection'),
        TypeOrmModule.forFeature([Address], 'arcane-connection'),
        JwtModule.register({
            global: true,
            secret: process.env.JWT_SECRET,
            signOptions: { expiresIn: '3600s' },
        }),
    ],
    controllers: [RolaController],
    providers: [RolaService],
})
export class RolaModule {}
