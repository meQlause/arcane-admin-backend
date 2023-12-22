import { Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { Address } from './address.entity';
import { Vote } from './vote.entity';

@Entity()
export class AddressVote {
    @PrimaryGeneratedColumn({ type: 'bigint' })
    id: number;

    // eslint-disable-next-line prettier/prettier, @typescript-eslint/no-unused-vars
    @ManyToOne((type) => Address, (address) => address.addressVotePair)
    address: Address;

    // eslint-disable-next-line prettier/prettier, @typescript-eslint/no-unused-vars
    @ManyToOne((type) => Vote, (vote) => vote.addressVotePair)
    vote: Vote;
}
