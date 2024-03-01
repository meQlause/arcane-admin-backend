import { Injectable, UnauthorizedException } from '@nestjs/common';
import { Rola, RolaError, SignedChallenge } from '@radixdlt/rola';
import { ResultAsync } from 'neverthrow';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { JwtService } from '@nestjs/jwt';
import {
    getVaultAddressAndNftId,
    AuthResponse,
    UserRole,
    RolaChallenge,
    Address,
} from '../modules/index';
import * as crypto from 'crypto';

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
            applicationName: `Arcane Labyrinth`,
            dAppDefinitionAddress: `${process.env.DAPPS_DEFINITION_ADDRESS}`,
            networkId: 2,
            expectedOrigin: `${process.env.EXPECTED_ORIGIN}`,
        });
    }

    /**
     * Generates secure random bytes and returns them as a hexadecimal string.
     *
     * @param byteCount The number of random bytes to generate.
     * @returns A hexadecimal string representing the generated random bytes.
     */
    private secureRandom(byteCount: number): string {
        return crypto.randomBytes(byteCount).toString('hex');
    }

    /**
     * Validates an address by searching for it in the database.
     *
     * @param address The address to validate.
     * @returns Promise<Address> The validated address object if found, otherwise null.
     */
    private async validateAddress(address: string): Promise<Address> {
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
        const challenge = await this.rolaChallengeRepo.findOne({
            where: { challenge: input },
        });
        if (!challenge) return false;
        await this.rolaChallengeRepo.remove(challenge);
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
                return {
                    access_token: undefined,
                    address: address,
                    role: UserRole.Unregistered,
                    nft_id: undefined,
                };
            }

            const [data, accessToken] = await Promise.all([
                getVaultAddressAndNftId(address, UserRole.Member),
                this.jwtService.signAsync({
                    address: account.address,
                    role: account.role,
                }),
            ]);

            return {
                access_token: accessToken,
                address: account.address,
                role: account.role,
                nft_id: data.nftId,
            };
        } catch (error) {
            console.error('Login failed:', error);
            throw new UnauthorizedException('Login failed');
        }
    }
}
