import { Injectable, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Address } from 'src/entities/arcane/address.entity';
import { Votes } from 'src/entities/arcane/votes.entity';
import { Repository } from 'typeorm';
import { CreateVoteDto } from './dto/create-vote-dto';
import { AddressVote } from 'src/entities/arcane/address-vote.entity';
import { Transactional } from 'typeorm-transactional';

@Injectable()
export class VotesService {
    constructor(
        @InjectRepository(Address, 'arcane-connection')
        private readonly AddressRepo: Repository<Address>,
        @InjectRepository(Votes, 'arcane-connection')
        private readonly VotesRepo: Repository<Votes>,
        @InjectRepository(AddressVote, 'arcane-connection')
        private readonly AddressVotesPairRepo: Repository<AddressVote>
    ) {}

    private async isRegistered(address: string): Promise<Address> {
        return await this.AddressRepo.findOne({ where: { address: address } });
    }

    @Transactional({ connectionName: 'arcane-datasource' })
    async createVote(data: CreateVoteDto): Promise<Votes> {
        const address = await this.isRegistered(data.address);
        if (!address) {
            throw new UnauthorizedException('address unregistered');
        }

        const voteToSave = this.VotesRepo.create({
            address: data.address,
            title: data.title,
            description: data.description,
            votes: data.votes,
        });

        const addressVotePair = this.AddressVotesPairRepo.create({
            address: address,
            votes: voteToSave,
        });
        console.log(addressVotePair);
        const isVoteSaved = await this.VotesRepo.save(voteToSave);
        const isAddressVotePairSaved =
            await this.AddressVotesPairRepo.insert(addressVotePair);

        if (!isVoteSaved || !isAddressVotePairSaved) {
            throw new UnauthorizedException(
                `Failed to save ${!isVoteSaved ? 'vote' : 'address vote pair'}`
            );
        }
        return isVoteSaved;
    }

    async pendingVotes(): Promise<Votes[]> {
        return await this.VotesRepo.find({ where: { isPending: true } });
    }
}
