import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Address } from 'src/entities/arcane/address.entity';
import { Discussions } from 'src/entities/arcane/discussion.entity';
import { Voters } from 'src/entities/arcane/voters.entity';
import { Votes } from 'src/entities/arcane/votes.entity';
import { VotesController } from './votes.controller';
import { VotesService } from './votes.service';

@Module({
    imports: [
        TypeOrmModule.forFeature([Address], 'arcane-connection'),
        TypeOrmModule.forFeature([Votes], 'arcane-connection'),
        TypeOrmModule.forFeature([Discussions], 'arcane-connection'),
        TypeOrmModule.forFeature([Voters], 'arcane-connection'),
    ],
    controllers: [VotesController],
    providers: [VotesService],
})
export class VotesModule {}
