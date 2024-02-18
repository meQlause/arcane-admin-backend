import { Body, Controller, Get, Param, Post, UseGuards } from '@nestjs/common';
import { CreateVoteDto } from './dto/create-vote-dto';
import { VotesService } from './votes.service';
import { Votes } from 'src/entities/arcane/votes.entity';
import { JWTGuard } from 'src/auth/guards/jwt-auth.guard';
import { AddVoteDto } from './dto/add-vote-dto';
import { Voters } from 'src/entities/arcane/voters.entity';
// import { AdminGuard } from 'src/auth/guards/admin-auth.guard';

@Controller('votes')
export class VotesController {
    constructor(private readonly votesService: VotesService) {}

    @UseGuards(JWTGuard)
    @Post('create-vote')
    async createVote(@Body() createVote: CreateVoteDto): Promise<Votes> {
        return this.votesService.createVote(createVote);
    }

    @Get('get-votes')
    async getVotes(): Promise<Votes[]> {
        return this.votesService.getVotes();
    }

    @UseGuards(JWTGuard)
    @Get('vote/:id')
    async getVoteId(@Param('id') id: number): Promise<Votes> {
        return await this.votesService.getVoteId(id);
    }

    @UseGuards(JWTGuard)
    @Post('add-vote')
    async addVote(@Body() addVote: AddVoteDto): Promise<Voters> {
        return await this.votesService.addVote(addVote);
    }
}
