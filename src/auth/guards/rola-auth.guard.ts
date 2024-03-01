import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Request } from 'express';
import { Result, ResultAsync } from 'neverthrow';
import { RolaError, SignedChallenge } from '@radixdlt/rola';
import { RolaService } from 'src/rola/rola.service';
import { LoggerService } from 'src/logger/logger.service';

@Injectable()
export class RolaGuard implements CanActivate {
    constructor(
        private rola: RolaService,
        private readonly logger: LoggerService
    ) {}

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
            data.map((signedChallenge) => {
                this.logger.log('verifying signed challenge');
                const data =
                    this.rola.rolaProperty.verifySignedChallenge(
                        signedChallenge
                    );
                return data;
            })
        );
    }
    async canActivate(context: ExecutionContext): Promise<boolean> {
        const data = this.convertData(
            context.switchToHttp().getRequest<Request>().body
        );
        this.logger.log(`User sign proof :`);
        this.logger.debug(data);

        const isChallengeStillValid = this.verifyChallengeData(data);
        if (!isChallengeStillValid) {
            this.logger.warn(`Error on Guard : data is not valid`);
            return false;
        }
        const isSignedChallengeValid = await this.verifySignedChallenge(data);
        if (isSignedChallengeValid.isErr()) {
            this.logger.warn(`Error.`);
            this.logger.log(isSignedChallengeValid.error.reason);
            this.logger.warn(`Error on Guard : signed data is not valid`);
            return false;
        }

        context.switchToHttp().getRequest<Request>()['address'] =
            data[0].address;
        this.logger.log(`Rola Guard passed`);
        return true;
    }
}
