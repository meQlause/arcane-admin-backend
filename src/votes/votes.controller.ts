import { Body, Controller, Get, Param, Post, UseGuards } from '@nestjs/common';
import { CreateVoteDto } from './dto/create-vote-dto';
import { VotesService } from './votes.service';
import { Votes } from 'src/entities/arcane/votes.entity';
import { JWTGuard } from 'src/auth/guards/jwt-auth.guard';
import { AdminGuard } from 'src/auth/guards/admin-auth.guard';

@Controller('votes')
export class VotesController {
    constructor(private readonly votesService: VotesService) {}

    @UseGuards(JWTGuard)
    @Post('create-vote')
    async createVote(@Body() createVote: CreateVoteDto): Promise<Votes> {
        return this.votesService.createVote(createVote);
    }

    @UseGuards(JWTGuard, AdminGuard)
    @Get('get-pending-votes')
    async getPendingVotes(): Promise<Votes[]> {
        return this.votesService.pendingVotes();
    }

    @Get('vote/:id')
    async getVoteId(@Param('id') id: number): Promise<Votes> {
        return await this.votesService.getVoteId(id);
    }
}
