import { PostgresConnectionOptions } from 'typeorm/driver/postgres/PostgresConnectionOptions';
import { RolaChallenge } from '../entities/rola-challenge/rola-challenge.entity';
import { Address } from '../entities/arcane/address.entity';
import { Discussions } from '../entities/arcane/discussion.entity';
import { Voters } from '../entities/arcane/voters.entity';
import { Proposal } from '../entities/arcane/proposal.entity';
import envConfig from './config';
import { Counter } from 'src/entities/arcane/counter.entity';

export const rolaChallenge: PostgresConnectionOptions = {
    type: 'postgres',
    database: 'rola_challenge',
    host: 'database',
    port: 5432,
    username: envConfig.userDb,
    password: envConfig.passwordDb,
    entities: [RolaChallenge],
    synchronize: envConfig.mode === 'dev_stokenet' ? true : false,
};

export const arcane: PostgresConnectionOptions = {
    type: 'postgres',
    database: 'arcane',
    host: 'database',
    port: 5432,
    username: envConfig.userDb,
    password: envConfig.passwordDb,
    entities: [Address, Proposal, Discussions, Voters, Counter],
    synchronize: envConfig.mode === 'dev_stokenet' ? true : false,
};
