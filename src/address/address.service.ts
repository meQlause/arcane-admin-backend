import { Injectable, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import {
    Address,
    UserRole,
    VaultNftId,
    getVaultAddressAndNftId,
    isWalletContainsBadge,
} from '../modules/index';

@Injectable()
export class AddressService {
    constructor(
        @InjectRepository(Address, 'arcane-connection')
        private readonly addressRepo: Repository<Address>
    ) {}

    /**
     * Retrieves a list of addresses associated with administrators.
     *
     * @returns Promise<Address[]> Array of Address objects.
     */
    async getAdmins(): Promise<Address[]> {
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
    async register(address: string, role: UserRole): Promise<Address> {
        const userRole: UserRole = await isWalletContainsBadge(address);
        if (userRole !== UserRole.Admin && userRole !== UserRole.Member) {
            throw new UnauthorizedException(
                `User ${address} is not a valid admin or member`
            );
        }

        const registeredAddress = this.addressRepo.create({
            address: address,
            role: role,
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
        return await this.addressRepo.findOne({ where: { address } });
    }

    /**
     * Grants admin privileges to an address.
     *
     * @param address The address to grant admin privileges.
     * @returns Promise<string> The address with admin privileges.
     */
    async makeAdmin(address: string): Promise<string> {
        const account = await this.addressRepo.findOne({ where: { address } });
        if (!account) {
            return UserRole.Unregistered;
        }
        const data: VaultNftId = await getVaultAddressAndNftId(
            address,
            UserRole.Admin
        );
        account.role = UserRole.Admin;
        account.vault_admin_address = data.vaultAddress;
        account.nft_id = data.nftId;
        await this.addressRepo.save(account);
        return account.address;
    }

    /**
     * Removes admin privileges from an address.
     *
     * @param address The address to revoke admin privileges.
     * @returns Promise<string> The address without admin privileges.
     */
    async unmakeAdmin(address: string): Promise<string> {
        const account = await this.addressRepo.findOne({ where: { address } });
        if (!account) {
            return UserRole.Unregistered;
        }
        account.role = UserRole.Member;
        account.nft_id = null;
        account.vault_admin_address = null;
        if ((await isWalletContainsBadge(address)) === UserRole.Unregistered) {
            await this.addressRepo.remove(account);
        } else {
            await this.addressRepo.save(account);
        }
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
