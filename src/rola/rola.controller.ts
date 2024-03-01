import { Controller, Get, Post, Request, UseGuards } from '@nestjs/common';
import { RolaService } from './rola.service';
import { RolaGuard } from '../auth/guards/rola-auth.guard';
import { AuthResponse } from 'src/custom';

@Controller('rola')
export class RolaController {
    constructor(private readonly rola: RolaService) {}

    /**
     * Generates a challenge for Rola authentication.
     *
     * @returns Promise<{ challenge: string }> Object containing the generated challenge.
     */
    @Get('generate-challenge')
    async generateChallenge(): Promise<{ challenge: string }> {
        const { challenge } = await this.rola.createChallenge();
        return { challenge: challenge };
    }

    /**
     * Verifies the authentication challenge and provides authentication response.
     *
     * @param req The request object containing the user's address.
     * @returns Promise<AuthResponse> Object containing the authentication response.
     */
    @UseGuards(RolaGuard)
    @Post('verify')
    async verify(@Request() req: any): Promise<AuthResponse> {
        return await this.rola.login(req.address);
    }
}
