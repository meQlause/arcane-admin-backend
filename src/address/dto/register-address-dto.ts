import { IsIn, IsString } from 'class-validator';
import { UserRole } from 'src/entities/arcane/address.entity';

export class RegisterAddressDto {
    @IsString()
    address: string;
    @IsIn(Object.values(UserRole))
    roles: UserRole;
}
