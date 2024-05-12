import {
    Body,
    Controller,
    Get,
    Param,
    Post,
    Put,
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
     * @param address The address to retrieve details for.
     * @returns Promise<Address> Address object containing details.
     */
    @UseGuards(JWTGuard, AdminGuard)
    @Get('get/:address')
    async verifyAddress(@Param('address') address: string): Promise<Address> {
        const methodName = 'verifyAddress';
        this.logger.log(`$Method: ${methodName} | Params: ${address}`);
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
        const methodName = 'get-admins';
        this.logger.log(`Method: ${methodName} | Params: -`);
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
        const methodName = 'register';
        this.logger.log(`$Method: ${methodName} | Params: ${registerAddress}`);
        return await this.addressService.register(
            registerAddress.id,
            registerAddress.address
        );
    }

    /**
     * Grants admin privileges to an address.
     *
     * @param address The address to grant admin privileges.
     * @returns Promise<string> Success message.
     */
    // @UseGuards(JWTGuard, AdminGuard)
    @Put('change-role-address/:address/:role')
    async makeAdmin(
        @Param('address') address: number,
        @Param('role') role: string
    ): Promise<string> {
        const methodName = 'make-admin';
        this.logger.log(`$Method: ${methodName} | Params: ${address}`);
        return await this.addressService.ChangeAddressTo(address, role);
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
        const methodName = 'getAddressVotes';
        this.logger.log(`$Method: ${methodName} | Params: ${address}`);
        return await this.addressService.getAddressVotes(address);
    }
}
