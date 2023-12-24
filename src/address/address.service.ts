import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Address, UserRole } from 'src/entities/arcane/address.entity';
import { Repository } from 'typeorm';
import { AddressType } from 'src/enum';
import * as dotenv from 'dotenv';
import { Item, ResponseData } from 'src/interfaces';
dotenv.config();

@Injectable()
export class AddressService {
    constructor(
        @InjectRepository(Address, 'arcane-connection')
        private readonly addressRepo: Repository<Address>
    ) {}

    private isRoleValid(items: Array<Item>, role: string): boolean {
        const neededResourceAddress: string =
            role === 'admin'
                ? process.env.ADMIN_RESOURCE_ADDRESS!
                : process.env.MEMBER_RESOURCE_ADDRESS!;
        return items.some((item: Item) => {
            return item.resource_address === neededResourceAddress;
        });
    }

    async register(address: string, role: UserRole) {
        const registeredAddress = this.addressRepo.create({
            address: address,
            role: role,
        });
        return await this.addressRepo.save(registeredAddress);
    }

    async verifyAddress(address: string): Promise<AddressType> {
        const body = {
            address,
        };

        return fetch(process.env.GATEWAY_API, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(body),
        })
            .then((response) => response.json())
            .then((data) => {
                const { items }: ResponseData = data;
                console.log(items);
                const admin = this.isRoleValid(items, 'admin');
                if (admin) {
                    return AddressType.Admin;
                }
                const member = this.isRoleValid(items, 'member');
                if (member) {
                    return AddressType.Member;
                }
                return AddressType.Unregistered;
            })
            .catch((error) => {
                console.error('Error:', error);
                return AddressType.Unregistered;
            })!;
    }
}
