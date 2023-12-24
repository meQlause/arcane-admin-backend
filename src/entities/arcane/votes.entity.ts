import {
    Column,
    CreateDateColumn,
    Entity,
    OneToOne,
    PrimaryGeneratedColumn,
} from 'typeorm';
import { AddressVote } from './address-vote.entity';

@Entity()
export class Votes {
    @PrimaryGeneratedColumn({ type: 'bigint' })
    id: number;

    @CreateDateColumn({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
    createdAt: Date;

    @Column({ type: 'text', nullable: false })
    address: string;

    @Column({ type: 'text', nullable: false })
    title: string;

    @Column({ type: 'text', nullable: false })
    description: string;

    @Column({ type: 'json', nullable: false })
    votes: Record<string, number>;

    @Column({ type: 'boolean', default: true })
    isPending: boolean;

    @OneToOne(() => AddressVote, (addressVote) => addressVote.votes)
    addressPair: AddressVote;
}
