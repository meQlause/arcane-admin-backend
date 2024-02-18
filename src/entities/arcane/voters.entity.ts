import {
    Column,
    CreateDateColumn,
    Entity,
    JoinColumn,
    ManyToOne,
    PrimaryGeneratedColumn,
} from 'typeorm';

import { Votes } from './votes.entity';
@Entity()
export class Voters {
    @PrimaryGeneratedColumn({ type: 'bigint' })
    id: number;

    @CreateDateColumn({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
    votedAt: Date;

    @Column({ type: 'text', nullable: false })
    voter: string;

    @Column({ type: 'text', nullable: false })
    selected: string;

    @Column({ type: 'bigint' })
    amount: number;

    @ManyToOne(() => Votes, (votes) => votes.voters)
    @JoinColumn()
    vote: Votes;
}
