import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class Counter {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ default: 0 })
    active: number;

    @Column({ default: 0 })
    reject: number;

    @Column({ default: 0 })
    pending: number;
}
