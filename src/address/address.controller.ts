import {
    Body,
    Controller,
    Get,
    Param,
    Post,
    Put,
    Query,
    UseGuards,
} from '@nestjs/common';
import { AddressService } from './address.service';
import { RegisterAddressDto } from './dto/register-address-dto';
import { Address } from 'src/entities/arcane/address.entity';
import { AdminGuard } from 'src/auth/guards/admin-auth.guard';
import { JWTGuard } from 'src/auth/guards/jwt-auth.guard';
import { LoggerService } from 'src/logger/logger.service';

@Controller('address')
export class AddressController {
    constructor(
        private readonly addressService: AddressService,
        private readonly logger: LoggerService
    ) {}

    /**
     * Retrieves address details based on the provided address.
     *
     * @param address - The address to retrieve details for.
     * @returns Promise<Address> - Address object containing details.
     *
     * @throws Will throw an error if the address does not exist or if the user is not authorized.
     *
     * @remarks
     * This method requires JWT and AdminGuard to be used as guards.
     *
     * @example
     * ```typescript
     * const address = 'account_rdx1xxx';
     * const addressDetail = await getAddressDetail(address);
     * console.log(addressDetail);
     * ```
     */
    @UseGuards(JWTGuard, AdminGuard)
    @Get('get-info/:address')
    async getAddressDetail(
        @Param('address') address: string
    ): Promise<Address> {
        this.logger.log(`[address] : Obtain ${address} detail.`);
        const res = await this.addressService.getAddressDetail(address);
        this.logger.log(`Response: ${JSON.stringify(res, null, 2)}`);
        return res;
    }

    /**
     * Retrieves a list of addresses associated with administrator role.
     *
     * @returns Promise<Address[]> Array of Address that has administrator role objects.
     *
     * @remarks
     * This method requires JWT and AdminGuard to be used as guards.
     *
     * @example
     * ```typescript
     * const adminList = await getAdminList();
     * console.log(adminList);
     * ```
     */
    @UseGuards(JWTGuard, AdminGuard)
    @Get('get-admin-list')
    async getAdminList(): Promise<Address[]> {
        this.logger.log(`[address] : Obtain admin list.`);
        const res = await this.addressService.getAdminList();
        this.logger.log(`Response: ${JSON.stringify(res, null, 2)}`);
        return res;
    }

    @Post('register')
    async register(
        @Body() registerAddress: RegisterAddressDto
    ): Promise<Address> {
        this.logger.log(`[address] : Registering ${registerAddress.address}.`);
        const res = await this.addressService.register(
            registerAddress.id,
            registerAddress.address
        );
        this.logger.log(`Response: ${JSON.stringify(res, null, 2)}`);
        return res;
    }

    /**
     * Grants admin privileges to an address.
     *
     * @remarks
     * This method requires JWT and AdminGuard to be used as guards.
     *
     * @param address - The address to grant admin privileges.
     * @param role - The role to assign to the address.
     *
     * @returns Promise<string> - A success message indicating that the role has been changed.
     *
     * @throws Will throw an error if the user is not authorized or if the address does not exist.
     *
     */
    @Put('change-address-role')
    async changeAddressRole(
        @Query('address') address: number,
        @Query('role') role: string
    ): Promise<Address> {
        this.logger.log(`[address] : change ${address}'s role to ${role}.`);
        const res = await this.addressService.changeAddressRole(address, role);
        this.logger.log(`Response: ${JSON.stringify(res, null, 2)}`);
        return res;
    }

    /**
     * Retrieves voting information related to an address.
     *
     * @remarks
     * This method requires JWTGuard to be used as a guard.
     *
     * @param address - The address to query votes for.
     * @returns Promise<Address> - Voting data related to address.
     *
     * @throws Will throw an error if the user is not authorized or if the address does not exist.
     */
    @UseGuards(JWTGuard)
    @Get('vote-list-by/:address')
    async getVoteListBy(@Param('address') address: string): Promise<Address> {
        this.logger.log(`[address] : Get Vote list filter by ${address}.`);
        const res = await this.addressService.getVoteListByAddress(address);
        this.logger.log(`Response: ${JSON.stringify(res, null, 2)}`);
        return res;
    }
}
