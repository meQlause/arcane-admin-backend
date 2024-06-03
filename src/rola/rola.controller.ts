import { Controller, Get, Post, Request, UseGuards } from '@nestjs/common';
import { RolaService } from './rola.service';
import { RolaGuard } from 'src/auth/guards/rola-auth.guard';
import { AuthResponse } from 'src/custom';
import { LoggerService } from 'src/logger/logger.service';

@Controller('rola')
export class RolaController {
    constructor(
        private readonly rola: RolaService,
        private readonly logger: LoggerService
    ) {}

    /**
     * Generates a challenge for Rola authentication.
     *
     * @returns Promise<{ challenge: string }> Object containing the generated challenge.
     */
    @Get('generate-challenge')
    async generateChallenge(): Promise<{ challenge: string }> {
        this.logger.log(`[rola] Generating challenge.`);
        const { challenge } = await this.rola.createChallenge();
        this.logger.log(`[rola] Challenge : ${challenge}.`);
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
        this.logger.log(`[rola] Verifying ${req}`);
        const res = await this.rola.login(req.address);
        this.logger.log(`Response: ${JSON.stringify(res, null, 2)}`);
        return res;
    }
}
