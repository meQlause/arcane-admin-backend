import { IsNotEmpty, IsNumber } from 'class-validator';

export class WithdrawVoteDto {
    @IsNumber()
    @IsNotEmpty()
    addressId: number;

    @IsNumber()
    @IsNotEmpty()
    voteId: number;
}
