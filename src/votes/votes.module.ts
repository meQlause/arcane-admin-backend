import { Module } from '@nestjs/common';
import { VotesController } from './votes.controller';
import { VotesService } from './votes.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Address } from 'src/entities/arcane/address.entity';
import { Votes } from 'src/entities/arcane/votes.entity';
import { AddressVote } from 'src/entities/arcane/address-vote.entity';
@Module({
    imports: [
        TypeOrmModule.forFeature([Address], 'arcane-connection'),
        TypeOrmModule.forFeature([Votes], 'arcane-connection'),
        TypeOrmModule.forFeature([AddressVote], 'arcane-connection'),
    ],
    controllers: [VotesController],
    providers: [VotesService],
})
export class VotesModule {}
