import { PostgresConnectionOptions } from 'typeorm/driver/postgres/PostgresConnectionOptions';
import { RolaChallenge } from 'src/entities/rola-challenge/rola-challenge.entity';
import { Address } from 'src/entities/arcane/address.entity';
import { Votes } from 'src/entities/arcane/votes.entity';
import { AddressVote } from 'src/entities/arcane/address-vote.entity';
import * as dotenv from 'dotenv';
dotenv.config();

export const rolaChallenge: PostgresConnectionOptions = {
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
    type: 'postgres',
    database: 'arcane',
    host: 'database',
    port: 5432,
    username: process.env.USER_DB,
    password: process.env.PASSWORD_DB,
    entities: [Address, Votes, AddressVote],
    synchronize: true,
};
