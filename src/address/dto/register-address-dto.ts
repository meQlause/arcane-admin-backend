import { IsString } from 'class-validator';

export class RegisterAddressDto {
    @IsString()
    address: string;
}
