import {
    VotesController,
    VotesService,
    Address,
    Votes,
    Discussions,
    Voters,
} from '../modules/index';
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

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
