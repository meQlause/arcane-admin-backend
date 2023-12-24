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

    @OneToMany(() => AddressVote, (addressVote) => addressVote.address)
    votePair: AddressVote[];

    get isAdmin(): boolean {
        return this.role === UserRole.Admin;
    }

    get isMember(): boolean {
        return this.role === UserRole.Member;
    }
}
