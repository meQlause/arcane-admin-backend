import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AddressController, AddressService, Address } from '../modules/index';
@Module({
    imports: [TypeOrmModule.forFeature([Address], 'arcane-connection')],
    controllers: [AddressController],
    providers: [AddressService],
})
export class AddressModule {}
