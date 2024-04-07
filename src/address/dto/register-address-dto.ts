import { IsString, IsNumber } from 'class-validator';

export class RegisterAddressDto {
    @IsNumber()
    id: number;

    @IsString()
    address: string;
}
