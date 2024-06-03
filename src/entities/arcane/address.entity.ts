import { UserRole } from 'src/custom';
import {
    Column,
    CreateDateColumn,
    Entity,
    ManyToMany,
    OneToMany,
    PrimaryColumn,
} from 'typeorm';
import { Discussions } from './discussion.entity';
import { Proposal } from './proposal.entity';

@Entity()
export class Address {
    @PrimaryColumn()
    id: number;

    @Column({ unique: true, nullable: false })
    address: string;

    @Column({
        type: 'enum',
        enum: UserRole,
    })
    role: UserRole;

    @Column({ unique: true, nullable: true })
    vault_address: string;

    @Column({ unique: true, nullable: true })
    profile_pict: string;

    @CreateDateColumn({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
    sign_up_at: Date;

    @OneToMany(() => Proposal, (proposal) => proposal.address)
    proposals: Proposal[];

    @ManyToMany(() => Discussions, (discussion) => discussion.addresses)
    discussions: Discussions[];

    get isAdmin(): boolean {
        return this.role === UserRole.Admin;
    }

    get isMember(): boolean {
        return this.role === UserRole.Member;
    }
}
