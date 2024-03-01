import {
    Column,
    CreateDateColumn,
    Entity,
    JoinColumn,
    ManyToOne,
    OneToMany,
    OneToOne,
    PrimaryGeneratedColumn,
} from 'typeorm';

import { Address, Discussions, Voters } from '../../modules/index';

@Entity()
export class Votes {
    @PrimaryGeneratedColumn({ type: 'bigint' })
    id: number;

    @CreateDateColumn({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
    startDate: Date;

    @CreateDateColumn({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
    endDate: Date;

    @Column({ type: 'text', nullable: false })
    title: string;

    @Column({ type: 'text', nullable: false })
    description: string;

    @Column({ type: 'text', nullable: false })
    componentAddress: string;

    @Column({ type: 'json', nullable: false })
    photos: Record<string, number>;

    @Column({ type: 'json', nullable: false })
    voteTokenAmount: Record<string, number>;

    @Column({ type: 'json', nullable: false })
    voteAddressCount: Record<string, number>;

    @Column({ type: 'boolean', default: true })
    isPending: boolean;

    @OneToMany(() => Voters, (voters) => voters.vote)
    voters: Voters[];

    @ManyToOne(() => Address, (address) => address.votes)
    @JoinColumn()
    address: Address;

    @OneToOne(() => Discussions, (discussion) => discussion.votes)
    @JoinColumn()
    discussion: Discussions;
}
