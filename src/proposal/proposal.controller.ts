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
    UnauthorizedException,
    UploadedFile,
    UseGuards,
    UseInterceptors,
} from '@nestjs/common';

import { FileInterceptor } from '@nestjs/platform-express';
import { Response } from 'express';
import { JWTGuard } from 'src/auth/guards/jwt-auth.guard';
import { Voters } from 'src/entities/arcane/voters.entity';
import { Proposal } from 'src/entities/arcane/proposal.entity';
import { AddVoteDto } from './dto/add-vote-dto';
import { CreateProposalDto } from './dto/create-proposal-dto';
import { PhotoUploadInterceptor } from './interceptors/photo-upload.interceptor';
import { ProposalService } from './proposal.service';
import { LoggerService } from 'src/logger/logger.service';
import { WithdrawVoteDto } from './dto/withdraw-vote-dto';
import { Status } from 'src/custom';
import { Address } from 'src/entities/arcane/address.entity';

@Controller('proposal')
export class ProposalController {
    constructor(
        private readonly votesService: ProposalService,
        private readonly logger: LoggerService
    ) {}

    /**
     * Creates a new vote.
     *
     * @param createProposal The data for creating the vote.
     * @returns Promise<Proposal> The newly created vote object.
     */
    @Post('create-proposal')
    async createProposal(
        @Body() createProposal: CreateProposalDto
    ): Promise<Proposal> {
        this.logger.log(`[vote] Address validation.`);
        const address: Address = await this.votesService.validateAddress(
            createProposal.owner
        );

        if (!address) {
            throw new UnauthorizedException('Address is unregistered');
        }
        this.logger.log(`Response: ${JSON.stringify(address, null, 2)}`);

        this.logger.log(`[vote] Create new Proposal.`);
        const proposal = await this.votesService.createProposal(
            createProposal,
            address
        );
        this.logger.log(`Response: ${JSON.stringify(proposal, null, 2)}`);
        return proposal;
    }

    @Put('change-proposal-status')
    async changeStatus(
        @Query('id') id: number,
        @Query('status') status: Status
    ): Promise<Proposal | Proposal[]> {
        this.logger.log(`[vote] change proposal ${id} status to ${status}`);
        const res = await this.votesService.changeStatus(id, status);
        this.logger.log(`Response: ${JSON.stringify(res, null, 2)}`);
        return res;
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
        this.logger.log(`[vote] Upload picture`);
        if (!photo) {
            throw new BadRequestException('File is not a picture');
        }
        return `https://arcanedev.site:4001/proposal/pict/${photo.filename}`;
    }

    /**
     * Retrieves a picture by filename.
     *
     * @param filename The filename of the picture.
     * @param res The response object to send the file.
     */
    @Get('pict/:filename')
    async getPict(@Param('filename') filename: string, @Res() res: Response) {
        this.logger.log(`[vote] retrieving picture ${filename}`);
        res.sendFile(filename, { root: './uploads' });
    }

    /**
     * Retrieves all votes.
     *
     * @returns Promise<Proposal[]> An array of all vote objects.
     */
    @UseGuards(JWTGuard)
    @Get('get-proposal-list')
    async getProposalList(
        @Query('page') page: number,
        @Query('status') status: string
    ): Promise<Proposal[]> {
        this.logger.log(`[vote] Get proposal list`);
        const res = this.votesService.getProposalList(page, status.split(','));
        this.logger.log(`Response: ${JSON.stringify(res, null, 2)}`);
        return res;
    }

    @UseGuards(JWTGuard)
    @Get('counter')
    async getStatus(@Query('count') count: string): Promise<number> {
        return this.votesService.count(count.split(','));
    }

    @UseGuards(JWTGuard)
    @Get('get-proposal-list-by/:userId')
    async getProposalListByUserId(
        @Param('userId') userId: number
    ): Promise<Proposal[]> {
        this.logger.log(`[vote] Get proposal filtered by user id: ${userId}`);
        const res = await this.votesService.getProposalListByUserId(userId);
        this.logger.log(`Response: ${JSON.stringify(res, null, 2)}`);
        return res;
    }

    /**
     * Retrieves a vote by ID.
     *
     * @param id The ID of the vote.
     * @returns Promise<Proposal> The vote object.
     */
    @Get('detail/:id')
    async getProposalDetail(@Param('id') id: number): Promise<Proposal> {
        this.logger.log(`[vote] Get proposal's detail by id : ${id}`);
        const res = await this.votesService.getProposalDetail(id);
        this.logger.log(`Response: ${JSON.stringify(res, null, 2)}`);
        return res;
    }

    @UseGuards(JWTGuard)
    @Get('voter/')
    async getVoterDataForVote(
        @Query('proposalId') proposalId: number,
        @Query('nftId') nftId: string
    ): Promise<Voters> | undefined {
        this.logger.log(`[vote] Get spesific voter data for vote`);
        const res = await this.votesService.getVoterData(
            proposalId,
            BigInt(nftId)
        );
        this.logger.log(`Response: ${JSON.stringify(res, null, 2)}`);
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
    @Post('add-vote')
    async addVote(@Body() addVote: AddVoteDto): Promise<Voters> {
        this.logger.log(
            `[vote] Add vote for ${addVote.proposal_id} from ${addVote.address}`
        );
        const res = await this.votesService.addVote(addVote);
        this.logger.log(`Response: ${JSON.stringify(res, null, 2)}`);
        return res;
    }

    @Post('withdraw-vote')
    async withdraw(@Body() withdrawVote: WithdrawVoteDto): Promise<Voters> {
        this.logger.log(
            `[vote] Withdraw for ${withdrawVote.proposal_id} from ${withdrawVote.address_id} `
        );
        const res = await this.votesService.withdrawVote(withdrawVote);
        this.logger.log(`Response: ${JSON.stringify(res, null, 2)}`);
        return res;
    }

    @UseGuards(JWTGuard)
    @Get('get-voted-proposal-list/:id')
    async voterData(@Param('id') id: number): Promise<Voters[]> {
        this.logger.log(`[vote] Get Voted Proposal List by ${id}`);
        const res = await this.votesService.voterData(id);
        this.logger.log(`Response: ${JSON.stringify(res, null, 2)}`);
        return res;
    }
}
