import { Injectable, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ContainBadgeData, UserRole } from 'src/custom';
import { Address } from 'src/entities/arcane/address.entity';
import { isWalletContainsBadge } from 'src/helpers/RadixAPI';
import { LoggerService } from 'src/logger/logger.service';
import { Repository } from 'typeorm';

@Injectable()
export class AddressService {
    constructor(
        @InjectRepository(Address, 'arcane-connection')
        private readonly addressRepo: Repository<Address>,
        private readonly logger: LoggerService
    ) {}

    /**
     * Retrieves a list of addresses associated with administrators.
     *
     * @returns Promise<Address[]> Array of Address objects.
     */
    async getAdmins(): Promise<Address[]> {
        this.logger.log('Getting list of admins.');
        return await this.addressRepo.find({
            where: { role: UserRole.Admin },
        });
    }

    /**
     * Registers a new address.
     *
     * @param address The address to register.
     * @param role The role of the address.
     * @returns Promise<Address> Registered Address object.
     * @throws UnauthorizedException if the address is not a valid admin or member.
     */
    async register(id: number, address: string): Promise<Address> {
        this.logger.log('Getting wallet information.');
        const user: ContainBadgeData = await isWalletContainsBadge(address);
        if (user.role === UserRole.Unregistered) {
            this.logger.warn('address does not contain admin or member badge.');
            this.logger.fatal('Error.');
            throw new UnauthorizedException(
                `User ${address} is not a valid admin or member`
            );
        }
        this.logger.log('Address valid.');
        const registeredAddress = this.addressRepo.create({
            id: id,
            address: address,
            role: user.role,
            vault_address: user.vault_address,
        });
        return await this.addressRepo.save(registeredAddress);
    }

    /**
     * Retrieves address details based on the provided address.
     *
     * @param address The address to retrieve details for.
     * @returns Promise<Address> Address object containing details.
     */
    async get(address: string): Promise<Address | null> {
        this.logger.log('Getting address information.');
        return await this.addressRepo.findOne({ where: { address } });
    }

    async ChangeAddressTo(address: number, role: string): Promise<string> {
        this.logger.log('Getting address information.');
        const account = await this.addressRepo.findOne({
            where: { id: address },
        });
        if (!account) {
            this.logger.warn('This user is not a member of Arcane.');
            return UserRole.Unregistered;
        }
        if (role === 'a') {
            account.role = UserRole.Admin;
        } else if (role === 'm') {
            account.role = UserRole.Member;
        }
        this.logger.warn(`Success ${role}.`);
        await this.addressRepo.save(account);
        return account.address;
    }

    /**
     * Retrieves voting information related to an address.
     *
     * @param address The address to query votes for.
     * @returns Promise<Address> Voting data related to the address.
     */
    async getAddressVotes(address: string): Promise<Address> {
        return await this.addressRepo
            .createQueryBuilder('address')
            .leftJoinAndSelect('address.votes', 'votes')
            .where('address.address = :address', { address })
            .getOne();
    }
}
