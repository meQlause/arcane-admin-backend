import {
    Column,
    CreateDateColumn,
    Entity,
    OneToMany,
    PrimaryGeneratedColumn,
} from 'typeorm';
import { AddressVote } from './address-vote.entity';

@Entity()
export class Vote {
    @PrimaryGeneratedColumn({ type: 'bigint' })
    id: number;

    @Column({ type: 'text', nullable: false })
    description: string;

    @CreateDateColumn({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
    createdAt: Date;

    @Column({ type: 'json', nullable: false })
    votes: Record<string, number>;

    @Column({ type: 'boolean', default: false })
    isPending: boolean;

    // eslint-disable-next-line prettier/prettier, @typescript-eslint/no-unused-vars
    @OneToMany((type) => AddressVote, (addressVotePair) => addressVotePair.vote)
    addressVotePair: AddressVote[];
}
