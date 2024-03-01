import {
    Column,
    Entity,
    JoinTable,
    ManyToMany,
    OneToOne,
    PrimaryGeneratedColumn,
} from 'typeorm';
import { Votes, Address } from '../../modules/index';

@Entity()
export class Discussions {
    @PrimaryGeneratedColumn({ type: 'bigint' })
    id: number;

    @Column({ type: 'json', nullable: true })
    chat: Record<string, string>;

    @OneToOne(() => Votes, (votes) => votes.discussion)
    votes: Votes;

    @ManyToMany(() => Address, (address) => address.discussions)
    @JoinTable()
    addresses: Address[];
}
