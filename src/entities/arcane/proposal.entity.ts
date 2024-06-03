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
import { Status } from 'src/custom';

@Entity()
export class Proposal {
    @PrimaryColumn()
    id: number;

    @Column({ type: 'bigint', nullable: false })
    start_epoch: number;

    @Column({ type: 'bigint', nullable: false })
    end_epoch: number;

    @Column({ type: 'text', nullable: true })
    title: string;

    @Column({ type: 'text', nullable: false })
    metadata: string;

    @Column({ type: 'text', nullable: false })
    description: string;

    @Column({ type: 'text', nullable: false })
    component_address: string;

    @Column({ type: 'text', nullable: false })
    created_by: string;

    @Column({ type: 'text', nullable: false })
    picture: string;

    @Column({ type: 'json', nullable: false })
    vote_token_amount: Record<string, number>;

    @Column({ type: 'json', nullable: false })
    vote_address_count: Record<string, number>;

    @Column({ type: 'enum', enum: Status, default: Status.PENDING })
    status: Status;

    @OneToMany(() => Voters, (voters) => voters.proposal)
    voters: Voters[];

    @ManyToOne(() => Address, (address) => address.proposals)
    @JoinColumn()
    address: Address;

    @OneToOne(() => Discussions, (discussion) => discussion.proposal)
    @JoinColumn()
    discussion: Discussions;
}
