import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Address } from 'src/entities/arcane/address.entity';
import { AddressController } from './address.controller';
import { AddressService } from './address.service';
import { LoggerService } from 'src/logger/logger.service';
@Module({
    imports: [TypeOrmModule.forFeature([Address], 'arcane-connection')],
    controllers: [AddressController],
    providers: [AddressService, LoggerService],
})
export class AddressModule {}
