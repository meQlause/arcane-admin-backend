import { PostgresConnectionOptions } from 'typeorm/driver/postgres/PostgresConnectionOptions';
import { RolaChallenge } from 'src/entities/rola-challenge/rola-challenge.entity';
import { Address } from 'src/entities/arcane/address.entity';
import { Vote } from 'src/entities/arcane/vote.entity';
import { AddressVote } from 'src/entities/arcane/address-vote.entity';
import * as dotenv from 'dotenv';
dotenv.config();

export const rolaChallenge: PostgresConnectionOptions = {
    name: 'rola-challenge-connection',
    type: 'postgres',
    database: 'rola_challenge',
    host: 'database',
    port: 5432,
    username: process.env.USER_DB,
    password: process.env.PASSWORD_DB,
    entities: [RolaChallenge],
    synchronize: true,
};

export const arcane: PostgresConnectionOptions = {
    name: 'arcane-connection',
    type: 'postgres',
    database: 'arcane',
    host: 'database',
    port: 5432,
    username: process.env.USER_DB,
    password: process.env.PASSWORD_DB,
    entities: [Address, Vote, AddressVote],
    synchronize: true,
};
