import { Controller, Get, Post, Request, UseGuards } from '@nestjs/common';
import { RolaService } from './rola.service';
import { RolaGuard } from '../auth/guards/rola-auth.guard';

@Controller('rola')
export class RolaController {
    constructor(private readonly rola: RolaService) {}

    @Get('generate-challenge')
    async generateChallenge(): Promise<{ challenge: string }> {
        const { challenge } = await this.rola.createChallenge();
        return { challenge: challenge };
    }

    @UseGuards(RolaGuard)
    @Post('verify')
    async verify(
        @Request() req: any
    ): Promise<{ access_token: string; role: string; address: string }> {
        return await this.rola.login(req.address);
    }
}
