import {
    Column,
    CreateDateColumn,
    Entity,
    OneToMany,
    PrimaryGeneratedColumn,
} from 'typeorm';
import { AddressVote } from './address-vote.entity';

export enum UserRole {
    Admin = 'admin',
    Member = 'member',
}

@Entity()
export class Address {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ unique: true, nullable: false })
    address: string;

    @Column({
        type: 'enum',
        enum: UserRole,
    })
    role: UserRole;

    @CreateDateColumn({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
    createdAt: Date;

    @OneToMany(
        // eslint-disable-next-line prettier/prettier, @typescript-eslint/no-unused-vars
        (type) => AddressVote,
        (addressVotePair) => addressVotePair.address
    )
    addressVotePair: AddressVote[];

    get isAdmin(): boolean {
        return this.role === UserRole.Admin;
    }

    get isMember(): boolean {
        return this.role === UserRole.Member;
    }
}
