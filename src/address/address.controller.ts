import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { RegisterAddressDto } from './dto/register-address-dto';
import { Address } from 'src/entities/arcane/address.entity';
import { AddressService } from './address.service';
import { AddressType } from 'src/enum';

@Controller('address')
export class AddressController {
    constructor(private readonly addressService: AddressService) {}

    @Get('verify/:address')
    async verifyAddress(
        @Param('address') address: string
    ): Promise<{ role: AddressType }> {
        return {
            role: await this.addressService.verifyAddress(address),
        };
    }

    @Post('register')
    async register(
        @Body() registerAddress: RegisterAddressDto
    ): Promise<Address> {
        return await this.addressService.register(
            registerAddress.address,
            registerAddress.roles
        );
    }
}
