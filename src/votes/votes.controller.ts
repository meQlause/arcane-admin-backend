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
import { CreateVoteDto } from './dto/create-vote-dto';
import { VotesService } from './votes.service';
import { Votes } from 'src/entities/arcane/votes.entity';
import { JWTGuard } from 'src/auth/guards/jwt-auth.guard';
import { AddVoteDto } from './dto/add-vote-dto';
import { Voters } from 'src/entities/arcane/voters.entity';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { Response } from 'express';

@Controller('votes')
export class VotesController {
    constructor(private readonly votesService: VotesService) {}

    @UseGuards(JWTGuard)
    @Post('create-vote')
    async createVote(@Body() createVote: CreateVoteDto): Promise<Votes> {
        return this.votesService.createVote(createVote);
    }

    @UseGuards(JWTGuard)
    @UseInterceptors(
        FileInterceptor('photos', {
            storage: diskStorage({
                destination: './uploads',
                filename: (req, file, cb) => {
                    const uniqueName =
                        'file-' +
                        Date.now() +
                        '-' +
                        Math.floor(Math.random() * 1000000) +
                        '.' +
                        file.mimetype.split('/')[1];

                    cb(null, uniqueName);
                },
            }),
            fileFilter: (req, file, cb) => {
                if (!file.originalname.match(/\.(jpg|jpeg|png)$/)) {
                    return cb(null, false);
                }
                if (file.size > 2000000) {
                    return cb(null, false);
                }
                return cb(null, true);
            },
        })
    )
    @Post('upload-picts')
    async uploadPict(@UploadedFile() photos: Express.Multer.File) {
        if (!photos) {
            throw new BadRequestException('File is not a pict');
        }
        return `https://host.docker.internal:4001/votes/picts/${photos.filename}`;
    }

    @Get('picts/:filename')
    async getPict(@Param('filename') filename: string, @Res() res: Response) {
        res.sendFile(filename, { root: './uploads' });
    }

    @Get('get-votes')
    async getVotes(): Promise<Votes[]> {
        return this.votesService.getVotes();
    }

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
