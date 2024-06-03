import {
    Column,
    Entity,
    JoinTable,
    ManyToMany,
    OneToOne,
    PrimaryGeneratedColumn,
} from 'typeorm';
import { Address } from './address.entity';
import { Proposal } from './proposal.entity';

@Entity()
export class Discussions {
    @PrimaryGeneratedColumn({ type: 'bigint' })
    id: number;

    @Column({ type: 'json', nullable: true })
    chat: Record<string, string>;

    @OneToOne(() => Proposal, (proposal) => proposal.discussion)
    proposal: Proposal;

    @ManyToMany(() => Address, (address) => address.discussions)
    @JoinTable()
    addresses: Address[];
}
