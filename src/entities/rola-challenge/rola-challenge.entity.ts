import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class RolaChallenge {
    @PrimaryGeneratedColumn({ type: 'bigint' })
    id: number;
    @Column({ unique: true, nullable: false })
    challenge: string;
    @Column({ type: 'bigint', nullable: false })
    expires: number;
}
