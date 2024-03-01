import { Injectable, UnauthorizedException } from '@nestjs/common';
import { Rola, RolaError, SignedChallenge } from '@radixdlt/rola';
import { ResultAsync } from 'neverthrow';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { JwtService } from '@nestjs/jwt';

import * as crypto from 'crypto';
import { AuthResponse, UserRole } from 'src/custom';
import { Address } from 'src/entities/arcane/address.entity';
import { RolaChallenge } from 'src/entities/rola-challenge/rola-challenge.entity';
import { getVaultAddressAndNftId } from 'src/helpers/RadixAPI';
import envConfig from 'src/config/env.config';
import { LoggerService } from 'src/logger/logger.service';

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
        private jwtService: JwtService,
        private readonly logger: LoggerService
    ) {
        this.rolaProperty = Rola({
            applicationName: `Arcane Labyrinth`,
            dAppDefinitionAddress: `${envConfig().dappsDefinitionAddress}`,
            networkId: 2,
            expectedOrigin: `${envConfig().expectedOrigin}`,
        });
    }

    /**
     * Generates secure random bytes and returns them as a hexadecimal string.
     *
     * @param byteCount The number of random bytes to generate.
     * @returns A hexadecimal string representing the generated random bytes.
     */
    private secureRandom(byteCount: number): string {
        this.logger.log('Generating random hex.');
        return crypto.randomBytes(byteCount).toString('hex');
    }

    /**
     * Validates an address by searching for it in the database.
     *
     * @param address The address to validate.
     * @returns Promise<Address> The validated address object if found, otherwise null.
     */
    private async validateAddress(address: string): Promise<Address> {
        this.logger.log('Getting address information.');
        return await this.AddressRepo.findOne({
            where: { address: address },
        });
    }

    /**
     * Creates a new Rola authentication challenge.
     *
     * @returns Promise<RolaChallenge> The created Rola authentication challenge.
     */
    async createChallenge(): Promise<RolaChallenge> {
        this.logger.log('generating challenge.');
        const challenge = this.secureRandom(32);
        const expires = Date.now() + 1000 * 60 * 5;
        const challengeToSave = this.rolaChallengeRepo.create({
            challenge,
            expires,
        });
        return await this.rolaChallengeRepo.save(challengeToSave);
    }

    /**
     * Verifies a Rola authentication challenge.
     *
     * @param input The input challenge string to verify.
     * @returns Promise<boolean> True if the challenge is valid and not expired, otherwise false.
     */
    async verifyChallenge(input: string): Promise<boolean> {
        this.logger.debug(`rola property ${this.rolaProperty}`);
        this.logger.log('Getting challenge information.');
        const challenge = await this.rolaChallengeRepo.findOne({
            where: { challenge: input },
        });
        if (!challenge) {
            this.logger.warn('Challenge is not valid (expired).');
            return false;
        }
        this.logger.log('Challenge valid, Remove from database.');
        await this.rolaChallengeRepo.remove(challenge);
        this.logger.warn('Valid.');
        return challenge.expires > Date.now();
    }

    /**
     * Logs in a user and generates an authentication response.
     *
     * @param address The user's address for authentication.
     * @returns Promise<AuthResponse> The authentication response containing access token, user's address, role, and NFT ID (if applicable).
     */
    async login(address: string): Promise<AuthResponse> {
        try {
            const account = await this.validateAddress(address);
            if (!account) {
                this.logger.warn('Address is not valid.');
                return {
                    access_token: undefined,
                    address: address,
                    role: UserRole.Unregistered,
                    nft_id: undefined,
                };
            }
            this.logger.log('address valid, validate data.');
            const [data, accessToken] = await Promise.all([
                getVaultAddressAndNftId(address, UserRole.Member),
                this.jwtService.signAsync({
                    address: account.address,
                    role: account.role,
                }),
            ]);
            this.logger.log('Valid.');
            return {
                access_token: accessToken,
                address: account.address,
                role: account.role,
                nft_id: data.nftId,
            };
        } catch (error) {
            this.logger.fatal(`Error ${error}.`);

            throw new UnauthorizedException('Login failed');
        }
    }
}
