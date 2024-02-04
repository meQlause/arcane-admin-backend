import { Module } from '@nestjs/common';
import { RolaModule } from './rola/rola.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { rolaChallenge, arcane } from 'ormconfig';
import { AddressModule } from './address/address.module';
import { VotesModule } from './votes/votes.module';
import { addTransactionalDataSource } from 'typeorm-transactional';
import { DataSource } from 'typeorm';
@Module({
    imports: [
        TypeOrmModule.forRootAsync({
            name: 'rola-challenge-connection',
            useFactory() {
                return rolaChallenge;
            },
            async dataSourceFactory(options) {
                if (!options) {
                    throw new Error('Invalid options passed');
                }

                return addTransactionalDataSource({
                    name: 'rola-challenge-datasource',
                    dataSource: new DataSource(options),
                });
            },
        }),
        TypeOrmModule.forRootAsync({
            name: 'arcane-connection',
            useFactory() {
                return arcane;
            },
            async dataSourceFactory(options) {
                if (!options) {
                    throw new Error('Invalid options passed');
                }

                return addTransactionalDataSource({
                    name: 'arcane-datasource',
                    dataSource: new DataSource(options),
                });
            },
        }),
        RolaModule,
        AddressModule,
        VotesModule,
    ],
})
export class AppModule {}
