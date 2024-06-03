import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Request } from 'express';
import { ResultAsync } from 'neverthrow';
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
    ): Promise<ResultAsync<void, RolaError>> {
        return await this.rola.rolaProperty.verifySignedChallenge(data[0]);
    }
    async canActivate(context: ExecutionContext): Promise<boolean> {
        const data = this.convertData(
            context.switchToHttp().getRequest<Request>().body
        );
        const isChallengeStillValid = await this.verifyChallengeData(data);
        if (!isChallengeStillValid) {
            this.logger.fatal(`Error on Guard : data is not valid`);
            return false;
        }
        const isSignedChallengeValid = await this.verifySignedChallenge(data);

        this.logger.log(isSignedChallengeValid.isErr());
        if (isSignedChallengeValid.isErr()) {
            this.logger.fatal(`Error on Guard : signed data is not valid`);
            return false;
        }

        context.switchToHttp().getRequest<Request>()['address'] =
            data[0].address;
        this.logger.log(`Rola Guard passed`);
        return true;
    }
}
