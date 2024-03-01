import {
    Body,
    Controller,
    Get,
    Param,
    Post,
    Put,
    UseGuards,
} from '@nestjs/common';
import {
    RegisterAddressDto,
    AddressService,
    JWTGuard,
    AdminGuard,
    Address,
    UserRole,
} from '../modules/index';

@Controller('address')
export class AddressController {
    constructor(private readonly addressService: AddressService) {}

    /**
     * Retrieves address details based on the provided address.
     *
     * @param address The address to retrieve details for.
     * @returns Promise<Address> Address object containing details.
     */
    @UseGuards(JWTGuard, AdminGuard)
    @Get('get/:address')
    async verifyAddress(@Param('address') address: string): Promise<Address> {
        return await this.addressService.get(address);
    }

    /**
     * Retrieves a list of addresses associated with administrators.
     *
     * @returns Promise<Address[]> Array of Address objects.
     */
    @UseGuards(JWTGuard, AdminGuard)
    @Get('get-admins')
    async getAdmins(): Promise<Address[]> {
        return await this.addressService.getAdmins();
    }

    /**
     * Registers a new address.
     *
     * @param registerAddress Address details to register.
     * @returns Promise<Address> Registered Address object.
     */
    @Post('register')
    async register(
        @Body() registerAddress: RegisterAddressDto
    ): Promise<Address> {
        return await this.addressService.register(
            registerAddress.address,
            UserRole.Member
        );
    }

    /**
     * Grants admin privileges to an address.
     *
     * @param address The address to grant admin privileges.
     * @returns Promise<string> Success message.
     */
    @UseGuards(JWTGuard, AdminGuard)
    @Put('make-admin/:address')
    async makeAdmin(@Param('address') address: string): Promise<string> {
        return await this.addressService.makeAdmin(address);
    }

    /**
     * Removes admin privileges from an address.
     *
     * @param address The address to revoke admin privileges.
     * @returns Promise<string> Success message.
     */
    @UseGuards(JWTGuard, AdminGuard)
    @Put('unmake-admin/:address')
    async unmakeAdmin(@Param('address') address: string): Promise<string> {
        return await this.addressService.unmakeAdmin(address);
    }

    /**
     * Retrieves voting information related to an address.
     *
     * @param address The address to query votes for.
     * @returns Promise<Address> Voting data related to address.
     */
    @UseGuards(JWTGuard)
    @Get('votes/:address')
    async getAddressVotes(@Param('address') address: string): Promise<Address> {
        return await this.addressService.getAddressVotes(address);
    }
}
