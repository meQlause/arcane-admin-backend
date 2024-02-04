import {
    Body,
    Controller,
    Get,
    Param,
    Post,
    Put,
    UseGuards,
} from '@nestjs/common';
import { RegisterAddressDto } from './dto/register-address-dto';
import { Address } from 'src/entities/arcane/address.entity';
import { AddressService } from './address.service';
import { UserRole } from 'src/custom';
import { JWTGuard } from 'src/auth/guards/jwt-auth.guard';
import { AdminGuard } from 'src/auth/guards/admin-auth.guard';

@Controller('address')
export class AddressController {
    constructor(private readonly addressService: AddressService) {}

    @UseGuards(JWTGuard, AdminGuard)
    @Get('get/:address')
    async verifyAddress(@Param('address') address: string): Promise<Address> {
        return await this.addressService.get(address);
    }

    @UseGuards(JWTGuard, AdminGuard)
    @Get('get-admins')
    async getAdmins(): Promise<Address[]> {
        return await this.addressService.getAdmins();
    }

    @Post('register')
    async register(
        @Body() registerAddress: RegisterAddressDto
    ): Promise<Address> {
        return await this.addressService.register(
            registerAddress.address,
            UserRole.Member
        );
    }

    @UseGuards(JWTGuard, AdminGuard)
    @Put('make-admin/:address')
    async makeAdmin(@Param('address') address: string): Promise<string> {
        return await this.addressService.makeAdmin(address);
    }

    @UseGuards(JWTGuard, AdminGuard)
    @Put('unmake-admin/:address')
    async unmakeAdmin(@Param('address') address: string): Promise<string> {
        return await this.addressService.unmakeAdmin(address);
    }

    @UseGuards(JWTGuard)
    @Get('votes/:address')
    async getAddressVotes(@Param('address') address: string) {
        return await this.addressService.getAddressVotes(address);
    }
}
