import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Request } from 'express';
import { Result, ResultAsync } from 'neverthrow';
import { RolaError, SignedChallenge } from '@radixdlt/rola';
import { RolaService } from 'src/rola/rola.service';

@Injectable()
export class RolaGuard implements CanActivate {
    constructor(private rola: RolaService) {}

    private convertData(data: any): SignedChallenge[] {
        return data as SignedChallenge[];
    }

    private verifyChallengeData(data: SignedChallenge[]): Promise<boolean> {
        return this.rola.verifyChallenge(
            [
                ...data
                    .reduce(
                        (acc, curr) => acc.add(curr.challenge),
                        new Set<string>()
                    )
                    .values(),
            ][0]
        );
    }

    private async verifySignedChallenge(
        data: SignedChallenge[]
    ): Promise<Result<void[], RolaError>> {
        return await ResultAsync.combine(
            data.map((signedChallenge) =>
                this.rola.rolaProperty.verifySignedChallenge(signedChallenge)
            )
        );
    }
    async canActivate(context: ExecutionContext): Promise<boolean> {
        const data = this.convertData(
            context.switchToHttp().getRequest<Request>().body
        );

        if (!this.verifyChallengeData(data)) return false;

        if ((await this.verifySignedChallenge(data)).isErr()) return false;

        context.switchToHttp().getRequest<Request>()['address'] =
            data[0].address;

        return true;
    }
}
