import {
    Column,
    CreateDateColumn,
    Entity,
    JoinColumn,
    ManyToOne,
    OneToOne,
    PrimaryGeneratedColumn,
} from 'typeorm';

import { Address } from './address.entity';
import { Discussions } from './discussion.entity';
@Entity()
export class Votes {
    @PrimaryGeneratedColumn({ type: 'bigint' })
    id: number;

    @CreateDateColumn({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
    startDate: Date;

    @CreateDateColumn({ type: 'timestamp' })
    endDate: Date;

    @Column({ type: 'text', nullable: false })
    title: string;

    @Column({ type: 'text', nullable: false })
    description: string;

    @Column({ type: 'json', nullable: false })
    vote_choice: Record<string, number>;

    @Column({ type: 'boolean', default: true })
    isPending: boolean;

    @ManyToOne(() => Address, (address) => address.votes)
    @JoinColumn()
    address: Address;

    @OneToOne(() => Discussions, (discussion) => discussion.votes)
    @JoinColumn()
    discussion: Discussions;
}
