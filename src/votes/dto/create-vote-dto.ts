import { IsArray, IsNotEmpty, IsNumber, IsString } from 'class-validator';

export class CreateVoteDto {
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
    startEpoch: number;
}
