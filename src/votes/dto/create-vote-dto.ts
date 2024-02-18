// import { IsArray, IsDateString, IsNotEmpty, IsString } from 'class-validator';
import { IsArray, IsNotEmpty, IsString } from 'class-validator';

export class CreateVoteDto {
    @IsString()
    @IsNotEmpty()
    address: string;

    @IsString()
    @IsNotEmpty()
    title: string;

    @IsString()
    @IsNotEmpty()
    description: string;

    @IsString()
    @IsNotEmpty()
    txId: string;

    @IsArray()
    @IsNotEmpty()
    votes: string[];

    // @IsDateString()
    // @IsNotEmpty()
    // startDate: Date;

    // @IsDateString()
    // @IsNotEmpty()
    // endDate: Date;
}
