import { Module } from '@nestjs/common';
import { VotesController } from './votes.controller';
import { VotesService } from './votes.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Address } from 'src/entities/arcane/address.entity';
import { Votes } from 'src/entities/arcane/votes.entity';
import { Discussions } from 'src/entities/arcane/discussion.entity';
@Module({
    imports: [
        TypeOrmModule.forFeature([Address], 'arcane-connection'),
        TypeOrmModule.forFeature([Votes], 'arcane-connection'),
        TypeOrmModule.forFeature([Discussions], 'arcane-connection'),
    ],
    controllers: [VotesController],
    providers: [VotesService],
})
export class VotesModule {}
