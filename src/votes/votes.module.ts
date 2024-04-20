import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Address } from 'src/entities/arcane/address.entity';
import { Discussions } from 'src/entities/arcane/discussion.entity';
import { Voters } from 'src/entities/arcane/voters.entity';
import { Votes } from 'src/entities/arcane/votes.entity';
import { VotesController } from './votes.controller';
import { VotesService } from './votes.service';
import { LoggerService } from 'src/logger/logger.service';
import { Counter } from 'src/entities/arcane/counter.entity';

@Module({
    imports: [
        TypeOrmModule.forFeature([Address], 'arcane-connection'),
        TypeOrmModule.forFeature([Votes], 'arcane-connection'),
        TypeOrmModule.forFeature([Discussions], 'arcane-connection'),
        TypeOrmModule.forFeature([Voters], 'arcane-connection'),
        TypeOrmModule.forFeature([Counter], 'arcane-connection'),
    ],
    controllers: [VotesController],
    providers: [VotesService, LoggerService],
})
export class VotesModule {}
