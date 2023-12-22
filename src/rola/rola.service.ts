import { Injectable, UnauthorizedException } from '@nestjs/common';
import { Rola, RolaError, SignedChallenge } from '@radixdlt/rola';
import { ResultAsync } from 'neverthrow';
import { InjectRepository } from '@nestjs/typeorm';
import { RolaChallenge } from 'src/entities/rola-challenge/rola-challenge.entity';
import { Address } from 'src/entities/arcane/address.entity';
import { Repository } from 'typeorm';
import * as crypto from 'crypto';
import * as dotenv from 'dotenv';
import { JwtService } from '@nestjs/jwt';
dotenv.config();

@Injectable()
export class RolaService {
    rolaProperty: {
        verifySignedChallenge: (
            signedChallenge: SignedChallenge
        ) => ResultAsync<void, RolaError>;
    };
    constructor(
        @InjectRepository(RolaChallenge, 'rola-challenge-connection')
        private readonly rolaChallengeRepo: Repository<RolaChallenge>,
        @InjectRepository(Address, 'arcane-connection')
        private readonly AddressRepo: Repository<Address>,
        private jwtService: JwtService
    ) {
        this.rolaProperty = Rola({
            applicationName: `Arcane`,
            dAppDefinitionAddress: `${process.env.DAPPS_DEFINITION_ADDRESS}`,
            networkId: 2,
            expectedOrigin: `${process.env.EXPECTED_ORIGIN}`,
        });
    }
    private secureRandom(byteCount: number): string {
        return crypto.randomBytes(byteCount).toString('hex');
    }
    async create(): Promise<RolaChallenge> {
        const challenge = this.secureRandom(32);
        const expires = Date.now() + 1000 * 60 * 5;
        const challengeToSave = this.rolaChallengeRepo.create({
            challenge,
            expires,
        });
        return await this.rolaChallengeRepo.save(challengeToSave);
    }
    async verifyChallenge(input: string): Promise<boolean> {
        const challenge = await this.rolaChallengeRepo.findOne({
            where: { challenge: input },
        });
        if (!challenge) return false;
        await this.rolaChallengeRepo.remove(challenge);
        return challenge.expires > Date.now();
    }
    async verifyRole(
        address: string
    ): Promise<{ access_token: string; role: string; address: string }> {
        const registeredAddress = await this.AddressRepo.findOne({
            where: { address: address },
        });
        if (!registeredAddress) {
            throw new UnauthorizedException();
        }

        const payload = {
            sub: registeredAddress.address,
            role: registeredAddress.role,
        };
        const accessToken = await this.jwtService.signAsync(payload);
        return {
            access_token: accessToken,
            role: registeredAddress.role,
            address: registeredAddress.address,
        };
    }
}
