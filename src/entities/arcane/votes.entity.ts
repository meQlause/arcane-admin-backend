import {
    Column,
    Entity,
    JoinColumn,
    ManyToOne,
    OneToMany,
    OneToOne,
    PrimaryColumn,
} from 'typeorm';
import { Address } from './address.entity';
import { Discussions } from './discussion.entity';
import { Voters } from './voters.entity';

@Entity()
export class Votes {
    @PrimaryColumn()
    id: number;

    @Column({ type: 'bigint', nullable: false })
    startEpoch: number;

    @Column({ type: 'bigint', nullable: false })
    endEpoch: number;

    @Column({ type: 'text', nullable: true })
    title: string;

    @Column({ type: 'text', nullable: false })
    metadata: string;

    @Column({ type: 'text', nullable: false })
    description: string;

    @Column({ type: 'text', nullable: false })
    componentAddress: string;

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
