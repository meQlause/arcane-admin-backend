import { IsNotEmpty, IsNumber, IsString } from 'class-validator';

export class AddVoteDto {
    @IsString()
    @IsNotEmpty()
    address: string;

    @IsString()
    @IsNotEmpty()
    key: string;

    @IsNumber()
    @IsNotEmpty()
    tokenAmount: number;

    @IsNumber()
    @IsNotEmpty()
    voteId: number;
}
