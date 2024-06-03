import {
    BadRequestException,
    Injectable,
    NotFoundException,
    UnauthorizedException,
} from '@nestjs/common';
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
     * Each Address object represents an admin user in the system.
     * The returned array contains all admin addresses.
     *
     * @throws Error If there is a database error during the retrieval process.
     */
    async getAdminList(): Promise<Address[]> {
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
        const user: ContainBadgeData = await isWalletContainsBadge(address);
        if (user.role === UserRole.Unregistered) {
            throw new UnauthorizedException(
                `User ${address} is not a valid admin or member`
            );
        }
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
    async getAddressDetail(address: string): Promise<Address | null> {
        return await this.addressRepo.findOne({ where: { address } });
    }

    async changeAddressRole(address: number, role: string): Promise<Address> {
        const account = await this.addressRepo.findOne({
            where: { id: address },
        });

        if (!account)
            throw new NotFoundException(
                `Account with ID ${address} not found.`
            );

        if (!['a', 'm'].includes(role))
            throw new BadRequestException(
                'Role type only available for admin and member'
            );
        account.role = role === 'a' ? UserRole.Admin : UserRole.Member;

        return this.addressRepo.save(account);
    }

    /**
     * Retrieves voting information related to an address.
     *
     * @param address The address to query votes for.
     * @returns Promise<Address> Voting data related to the address.
     */
    async getVoteListByAddress(address: string): Promise<Address> {
        return await this.addressRepo
            .createQueryBuilder('address')
            .leftJoinAndSelect('address.votes', 'votes')
            .where('address.address = :address', { address })
            .getOne();
    }
}
