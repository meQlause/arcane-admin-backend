import {
    Body,
    Controller,
    Get,
    Post,
    UnauthorizedException,
} from '@nestjs/common';
import { RolaService } from './rola.service';
import { SignedChallenge } from '@radixdlt/rola';
import { ResultAsync } from 'neverthrow';

@Controller('rola')
export class RolaController {
    constructor(private readonly rola: RolaService) {}

    @Get('generate-challenge')
    async generateChallenge(): Promise<{ challenge: string }> {
        const { challenge } = await this.rola.create();
        return { challenge: challenge };
    }

    @Post('verify')
    async verify(
        @Body() data: SignedChallenge[]
    ): Promise<{ access_token: string }> {
        const address = data[0].address;
        if (!address) {
            throw new UnauthorizedException();
        }
        const [challenge] = [
            ...data
                .reduce(
                    (acc, curr) => acc.add(curr.challenge),
                    new Set<string>()
                )
                .values(),
        ];

        if (!this.rola.verifyChallenge(challenge))
            throw new UnauthorizedException();

        const verifiedChallenge = await ResultAsync.combine(
            data.map((signedChallenge) =>
                this.rola.rolaProperty.verifySignedChallenge(signedChallenge)
            )
        );
        if (verifiedChallenge.isErr()) throw new UnauthorizedException();
        const res = await this.rola.verifyRole(address);
        return res;
    }
}
