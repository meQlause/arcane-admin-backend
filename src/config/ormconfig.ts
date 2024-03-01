import { PostgresConnectionOptions } from 'typeorm/driver/postgres/PostgresConnectionOptions';
import { RolaChallenge } from '../entities/rola-challenge/rola-challenge.entity';
import { Address } from '../entities/arcane/address.entity';
import { Discussions } from '../entities/arcane/discussion.entity';
import { Voters } from '../entities/arcane/voters.entity';
import { Votes } from '../entities/arcane/votes.entity';
import envConfig from './env.config';

export const rolaChallenge: PostgresConnectionOptions = {
    type: 'postgres',
    database: 'rola_challenge',
    host: 'database',
    port: 5432,
    username: envConfig().userDb,
    password: envConfig().passwordDb,
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
    entities: [Address, Votes, Discussions, Voters],
    synchronize: true,
};
