import { Module } from '@nestjs/common';
import { RolaModule } from './rola/rola.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { rolaChallenge, arcane } from 'ormconfig';
import { AddressModule } from './address/address.module';
@Module({
    imports: [
        RolaModule,
        AddressModule,
        TypeOrmModule.forRoot(rolaChallenge),
        TypeOrmModule.forRoot(arcane),
    ],
})
export class AppModule {}
