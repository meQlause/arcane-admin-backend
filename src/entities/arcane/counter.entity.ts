import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class Counter {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ default: 0 })
    active: number;

    @Column({ default: 0 })
    rejected: number;

    @Column({ default: 0 })
    pending: number;

    @Column({ default: 0 })
    closed: number;
}
