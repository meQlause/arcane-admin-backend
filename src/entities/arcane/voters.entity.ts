import {
    Column,
    CreateDateColumn,
    Entity,
    JoinColumn,
    ManyToOne,
    PrimaryGeneratedColumn,
} from 'typeorm';
import { Proposal } from './proposal.entity';

@Entity()
export class Voters {
    @PrimaryGeneratedColumn({ type: 'bigint' })
    id: number;

    @Column({ type: 'bigint' })
    address_id: number;

    @Column({ type: 'text' })
    title: string;

    @CreateDateColumn({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
    voted_at: Date;

    @Column({ type: 'text', nullable: false })
    voter: string;

    @Column({ type: 'text', nullable: false })
    selected: string;

    @Column({ type: 'bigint' })
    amount: number;

    @Column({ type: 'boolean', default: false })
    is_withdrawed: boolean;

    @ManyToOne(() => Proposal, (proposal) => proposal.voters)
    @JoinColumn()
    proposal: Proposal;
}
