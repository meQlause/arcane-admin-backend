import { Module } from '@nestjs/common';
import { AddressController } from './address.controller';
import { AddressService } from './address.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Address } from 'src/entities/arcane/address.entity';
import { Votes } from 'src/entities/arcane/votes.entity';
@Module({
    imports: [TypeOrmModule.forFeature([Address, Votes], 'arcane-connection')],
    controllers: [AddressController],
    providers: [AddressService],
})
export class AddressModule {}
