import { IsNotEmpty, IsNumber, IsString } from 'class-validator';

export class AddVoteDto {
    @IsNumber()
    @IsNotEmpty()
    address: number;

    @IsString()
    @IsNotEmpty()
    key: string;

    @IsNumber()
    @IsNotEmpty()
    token_amount: number;

    @IsNumber()
    @IsNotEmpty()
    proposal_id: number;
}
