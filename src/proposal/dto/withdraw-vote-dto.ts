import { IsNotEmpty, IsNumber } from 'class-validator';

export class WithdrawVoteDto {
    @IsNumber()
    @IsNotEmpty()
    address_id: number;

    @IsNumber()
    @IsNotEmpty()
    proposal_id: number;
}
