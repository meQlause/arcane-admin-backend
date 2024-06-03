import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Address } from 'src/entities/arcane/address.entity';
import { Discussions } from 'src/entities/arcane/discussion.entity';
import { Voters } from 'src/entities/arcane/voters.entity';
import { Proposal } from 'src/entities/arcane/proposal.entity';
import { ProposalController } from './proposal.controller';
import { ProposalService } from './proposal.service';
import { LoggerService } from 'src/logger/logger.service';
import { Counter } from 'src/entities/arcane/counter.entity';

@Module({
    imports: [
        TypeOrmModule.forFeature([Address], 'arcane-connection'),
        TypeOrmModule.forFeature([Proposal], 'arcane-connection'),
        TypeOrmModule.forFeature([Discussions], 'arcane-connection'),
        TypeOrmModule.forFeature([Voters], 'arcane-connection'),
        TypeOrmModule.forFeature([Counter], 'arcane-connection'),
    ],
    controllers: [ProposalController],
    providers: [ProposalService, LoggerService],
})
export class ProposalModule {}
