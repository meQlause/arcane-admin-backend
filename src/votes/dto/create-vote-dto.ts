import {
    IsArray,
    IsDateString,
    IsNotEmpty,
    IsString,
    IsUrl,
} from 'class-validator';

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

    @IsArray()
    @IsNotEmpty()
    @IsUrl({}, { each: true })
    photos: string[];

    @IsDateString()
    @IsNotEmpty()
    startDate: Date;

    @IsDateString()
    @IsNotEmpty()
    endDate: Date;
}
