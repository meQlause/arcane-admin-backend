import { IsArray, IsNotEmpty, IsNumber, IsString } from 'class-validator';

export class CreateProposalDto {
    @IsNumber()
    @IsNotEmpty()
    id: number;

    @IsNumber()
    @IsNotEmpty()
    owner: number;

    @IsString()
    @IsNotEmpty()
    address: string;

    @IsString()
    @IsNotEmpty()
    metadata: string;

    @IsArray()
    @IsNotEmpty()
    votes: string[];

    @IsNumber()
    @IsNotEmpty()
    start_epoch: number;

    @IsNumber()
    @IsNotEmpty()
    end_epoch: number;
}
