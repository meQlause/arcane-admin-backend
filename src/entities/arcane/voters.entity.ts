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

    @Column({ type: 'bigint' })
    AddressId: number;

    @Column({ type: 'text' })
    title: string;

    @CreateDateColumn({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
    votedAt: Date;

    @Column({ type: 'text', nullable: false })
    voter: string;

    @Column({ type: 'text', nullable: false })
    selected: string;

    @Column({ type: 'bigint' })
    amount: number;

    @Column({ type: 'boolean', default: false })
    isWithdrawed: boolean;

    @ManyToOne(() => Votes, (votes) => votes.voters)
    @JoinColumn()
    vote: Votes;
}
