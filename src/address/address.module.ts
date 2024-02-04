import { Module } from '@nestjs/common';
import { AddressController } from './address.controller';
import { AddressService } from './address.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Address } from 'src/entities/arcane/address.entity';
@Module({
    imports: [TypeOrmModule.forFeature([Address], 'arcane-connection')],
    controllers: [AddressController],
    providers: [AddressService],
})
export class AddressModule {}
