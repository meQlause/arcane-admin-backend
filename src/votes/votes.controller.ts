import {
    BadRequestException,
    Body,
    Controller,
    Get,
    Param,
    Post,
    Put,
    Query,
    Res,
    UploadedFile,
    UseGuards,
    UseInterceptors,
} from '@nestjs/common';

import { FileInterceptor } from '@nestjs/platform-express';
import { Response } from 'express';
import { JWTGuard } from 'src/auth/guards/jwt-auth.guard';
import { Voters } from 'src/entities/arcane/voters.entity';
import { Votes } from 'src/entities/arcane/votes.entity';
import { AddVoteDto } from './dto/add-vote-dto';
import { CreateVoteDto } from './dto/create-vote-dto';
import { PhotoUploadInterceptor } from './interceptors/photo-upload.interceptor';
import { VotesService } from './votes.service';
import { LoggerService } from 'src/logger/logger.service';
import { WithdrawVoteDto } from './dto/withdraw-vote-dto';
import { Status } from 'src/custom';

@Controller('votes')
export class VotesController {
    constructor(
        private readonly votesService: VotesService,
        private readonly logger: LoggerService
    ) {}

    /**
     * Creates a new vote.
     *
     * @param createVote The data for creating the vote.
     * @returns Promise<Votes> The newly created vote object.
     */
    @Post('create-vote')
    async createVote(@Body() createVote: CreateVoteDto): Promise<Votes> {
        const methodName = 'createVote';
        this.logger.log(`Method: ${methodName} | Params: ${createVote}`);
        return this.votesService.createVote(createVote);
    }

    @Put('change-proposal-status/:id/:status')
    async changeStatus(
        @Param('id') id: number,
        @Param('status') status: Status
    ): Promise<Votes | Votes[]> {
        const methodName = 'createVote';
        this.logger.log(`Method: ${methodName} | Params: `);
        return await this.votesService.changeStatus(id, status);
    }

    /**
     * Uploads pictures for votes.
     *
     * @param photo The uploaded photo.
     * @returns Promise<string> The URL of the uploaded picture.
     * @throws BadRequestException if the file is not a picture or exceeds the size limit.
     */
    @UseGuards(JWTGuard)
    @UseInterceptors(
        FileInterceptor(
            'photo',
            new PhotoUploadInterceptor().createMulterOptions()
        )
    )
    @Post('upload-pict')
    async uploadPict(@UploadedFile() photo: Express.Multer.File) {
        const methodName = 'uploadPict';
        this.logger.log(`Method: ${methodName} | Params: ${photo}`);
        if (!photo) {
            this.logger.fatal('File is not a picture');
            throw new BadRequestException('File is not a picture');
        }
        return `https://arcanedev.site:4001/votes/pict/${photo.filename}`;
    }

    /**
     * Retrieves a picture by filename.
     *
     * @param filename The filename of the picture.
     * @param res The response object to send the file.
     */
    @Get('pict/:filename')
    async getPict(@Param('filename') filename: string, @Res() res: Response) {
        const methodName = 'getPict';
        this.logger.log(`Method: ${methodName} | Params: ${filename}`);
        res.sendFile(filename, { root: './uploads' });
    }

    /**
     * Retrieves all votes.
     *
     * @returns Promise<Votes[]> An array of all vote objects.
     */
    @UseGuards(JWTGuard)
    @Get('get-votes')
    async getVotes(
        @Query('page') page: number,
        @Query('status') status: string
    ): Promise<Votes[]> {
        const methodName = 'getVotes';
        this.logger.log(`Method: ${methodName} | Params: -`);
        return this.votesService.getVotes(page, status.split(','));
    }

    @UseGuards(JWTGuard)
    @Get('counter')
    async getStatus(@Query('count') count: string): Promise<number> {
        const methodName = 'getVotes';
        this.logger.log(`Method: ${methodName} | Params: -`);
        return this.votesService.status(count.split(','));
    }

    @Get('get-votes-by/:id')
    async getVotesById(@Param('id') id: number): Promise<Votes[]> {
        const methodName = 'getVotesById';
        this.logger.log(`Method: ${methodName} | Params: ${id}`);
        return this.votesService.getVotesById(id);
    }

    /**
     * Retrieves a vote by ID.
     *
     * @param id The ID of the vote.
     * @returns Promise<Votes> The vote object.
     */
    @Get('vote/:id')
    async getVoteId(@Param('id') id: number): Promise<Votes> {
        const methodName = 'getVoteId';
        this.logger.log(`Method: ${methodName} | Params: ${id}`);
        return await this.votesService.getVoteId(id);
    }

    @Get('voter/:id/:nftId')
    async getVoterDataForVote(
        @Param('id') id: number,
        @Param('nftId') nftId: number
    ): Promise<Voters> | undefined {
        const methodName = 'getVoteId';
        this.logger.log(`Method: ${methodName} | Params: ${id}`);
        const res = await this.votesService.getVoterData(id, nftId);
        console.log(res);
        if (res) {
            return res;
        }
        return undefined;
    }

    /**
     * Adds a vote.
     *
     * @param addVote The data for adding the vote.
     * @returns Promise<Voters> The newly added voter object.
     */
    // @UseGuards(JWTGuard)
    @Post('add-vote')
    async addVote(@Body() addVote: AddVoteDto): Promise<Voters> {
        const methodName = 'addVote';
        this.logger.log(`Method: ${methodName} | Params: ${addVote}`);
        return await this.votesService.addVote(addVote);
    }

    @Post('withdraw-vote')
    async withdraw(@Body() WithdrawVote: WithdrawVoteDto): Promise<Voters> {
        const methodName = 'withdraw';
        this.logger.log(`Method: ${methodName} | Params: ${WithdrawVote}`);
        return await this.votesService.withdrawVote(WithdrawVote);
    }

    @UseGuards(JWTGuard)
    @Get('get-voter-data/:id')
    async voterData(@Param('id') id: number): Promise<Voters[]> {
        const methodName = 'voterData';
        this.logger.log(`Method: ${methodName} | Params: ${id}`);
        return await this.votesService.voterData(id);
    }
}
