import { Injectable, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Address } from 'src/entities/arcane/address.entity';
import { Repository } from 'typeorm';
import { UserRole, VaultNftId } from 'src/custom';
import {
    getAdminVaultAddressAndNftId,
    isWalletContainsBadge,
} from '../helpers/RadixAPI';
import * as dotenv from 'dotenv';
dotenv.config();

@Injectable()
export class AddressService {
    constructor(
        @InjectRepository(Address, 'arcane-connection')
        private readonly addressRepo: Repository<Address>
    ) {}

    async getAdmins(): Promise<Address[]> {
        return await this.addressRepo.find({
            where: { role: UserRole.Admin },
        });
    }

    async register(address: string, role: UserRole): Promise<Address> {
        const userRole = await isWalletContainsBadge(address);
        if (userRole !== UserRole.Admin && userRole !== UserRole.Member) {
            throw new UnauthorizedException(
                `User ${address} is not mint badge member yet`
            );
        }

        const registeredAddress = this.addressRepo.create({
            address: address,
            role: role,
        });
        return await this.addressRepo.save(registeredAddress);
    }

    async get(address: string): Promise<Address> {
        const account = await this.addressRepo.findOneBy({ address });
        if (!account) {
            return null;
        }
        return account;
    }

    async makeAdmin(address: string): Promise<string> {
        const account = await this.addressRepo.findOneBy({ address });
        if (!account) {
            return UserRole.Unregistered;
        }
        const data: VaultNftId = await getAdminVaultAddressAndNftId(address);
        account.role = UserRole.Admin;
        account.vault_admin_address = data.vaultAddress;
        account.nft_id = data.nftId;
        await this.addressRepo.save(account);
        return account.address;
    }

    async unmakeAdmin(address: string): Promise<string> {
        const account = await this.addressRepo.findOneBy({ address });
        if (!account) {
            return UserRole.Unregistered;
        }
        account.role = UserRole.Member;
        account.nft_id = null;
        account.vault_admin_address = null;
        if ((await isWalletContainsBadge(address)) === UserRole.Unregistered) {
            this.addressRepo.remove(account);
        }
        await this.addressRepo.save(account);
        console.log(account);
        return account.address;
    }

    async getAddressVotes(address: string): Promise<Address> {
        return await this.addressRepo
            .createQueryBuilder('address')
            .leftJoinAndSelect('address.votes', 'votes')
            .where('address.address = :address', { address })
            .getOne();
    }
}
