import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtModule } from '@nestjs/jwt';
import {
    RolaController,
    RolaService,
    RolaChallenge,
    Address,
} from '../modules/index';

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
