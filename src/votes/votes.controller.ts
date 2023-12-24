import { Body, Controller, Get, Post } from '@nestjs/common';
import { CreateVoteDto } from './dto/create-vote-dto';
import { VotesService } from './votes.service';
import { Votes } from 'src/entities/arcane/votes.entity';

@Controller('votes')
export class VotesController {
    constructor(private readonly votesService: VotesService) {}

    @Post('create-vote')
    async createVote(@Body() createVote: CreateVoteDto): Promise<Votes> {
        return this.votesService.createVote(createVote);
    }

    @Get('get-pending-votes')
    async getPendingVotes(): Promise<Votes[]> {
        return this.votesService.pendingVotes();
    }
}
