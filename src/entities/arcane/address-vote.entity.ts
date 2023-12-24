import {
    Entity,
    JoinColumn,
    ManyToOne,
    OneToOne,
    PrimaryGeneratedColumn,
} from 'typeorm';
import { Address } from './address.entity';
import { Votes } from './votes.entity';

@Entity()
export class AddressVote {
    @PrimaryGeneratedColumn({ type: 'bigint' })
    id: number;

    @ManyToOne(() => Address, (address) => address.votePair)
    @JoinColumn()
    address: Address;

    @OneToOne(() => Votes, (votes) => votes.addressPair)
    @JoinColumn()
    votes: Votes;
}
