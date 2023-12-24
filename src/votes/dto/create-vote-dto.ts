import { IsNotEmpty, IsObject, IsString } from 'class-validator';

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

    @IsObject()
    @IsNotEmpty()
    votes: Record<string, number>;
}
