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
    tokenAmount: number;

    @IsNumber()
    @IsNotEmpty()
    voteId: number;
}
