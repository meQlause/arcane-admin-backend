import {
    BadRequestException,
    Body,
    Controller,
    Get,
    Param,
    Post,
    Res,
    UploadedFile,
    UseGuards,
    UseInterceptors,
} from '@nestjs/common';
import {
    CreateVoteDto,
    VotesService,
    AddVoteDto,
    PhotoUploadInterceptor,
    Voters,
    Votes,
    JWTGuard,
} from '../modules/index';
import { FileInterceptor } from '@nestjs/platform-express';
import { Response } from 'express';

@Controller('votes')
export class VotesController {
    constructor(private readonly votesService: VotesService) {}

    /**
     * Creates a new vote.
     *
     * @param createVote The data for creating the vote.
     * @returns Promise<Votes> The newly created vote object.
     */
    @UseGuards(JWTGuard)
    @Post('create-vote')
    async createVote(@Body() createVote: CreateVoteDto): Promise<Votes> {
        return this.votesService.createVote(createVote);
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
        if (!photo) {
            throw new BadRequestException('File is not a picture');
        }
        return `https://host.docker.internal:4001/votes/pict/${photo.filename}`;
    }

    /**
     * Retrieves a picture by filename.
     *
     * @param filename The filename of the picture.
     * @param res The response object to send the file.
     */
    @Get('picts/:filename')
    async getPict(@Param('filename') filename: string, @Res() res: Response) {
        res.sendFile(filename, { root: './uploads' });
    }

    /**
     * Retrieves all votes.
     *
     * @returns Promise<Votes[]> An array of all vote objects.
     */
    @Get('get-votes')
    async getVotes(): Promise<Votes[]> {
        return this.votesService.getVotes();
    }

    /**
     * Retrieves a vote by ID.
     *
     * @param id The ID of the vote.
     * @returns Promise<Votes> The vote object.
     */
    @Get('vote/:id')
    async getVoteId(@Param('id') id: number): Promise<Votes> {
        return await this.votesService.getVoteId(id);
    }

    /**
     * Adds a vote.
     *
     * @param addVote The data for adding the vote.
     * @returns Promise<Voters> The newly added voter object.
     */
    @UseGuards(JWTGuard)
    @Post('add-vote')
    async addVote(@Body() addVote: AddVoteDto): Promise<Voters> {
        return await this.votesService.addVote(addVote);
    }
}
