import { Injectable, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Address } from 'src/entities/arcane/address.entity';
import { Votes } from 'src/entities/arcane/votes.entity';
import { Repository } from 'typeorm';
import { CreateVoteDto } from './dto/create-vote-dto';
import { Transactional } from 'typeorm-transactional';
import { Discussions } from 'src/entities/arcane/discussion.entity';

@Injectable()
export class VotesService {
    constructor(
        @InjectRepository(Address, 'arcane-connection')
        private readonly AddressRepo: Repository<Address>,
        @InjectRepository(Votes, 'arcane-connection')
        private readonly VotesRepo: Repository<Votes>,
        @InjectRepository(Discussions, 'arcane-connection')
        private readonly DiscussionRepo: Repository<Discussions>
    ) {}

    private async isRegistered(address: string): Promise<Address> {
        return await this.AddressRepo.findOne({ where: { address: address } });
    }

    @Transactional({ connectionName: 'arcane-datasource' })
    async createVote(data: CreateVoteDto): Promise<Votes> {
        const address: Address = await this.isRegistered(data.address);
        if (!address) {
            throw new UnauthorizedException('address unregistered');
        }

        const discussion: Discussions = this.DiscussionRepo.create({});

        const vote_choice = data.votes.reduce(
            (obj, key) => ({ ...obj, [key]: 0 }),
            {}
        );

        const vote: Votes = this.VotesRepo.create({
            startDate: data.startDate,
            endDate: data.endDate,
            title: data.title,
            description: data.description,
            isPending: true,
            vote_choice: vote_choice,
        });

        vote.discussion = discussion;
        vote.address = address;
        address.discussions = [discussion];

        await this.DiscussionRepo.save(discussion);
        await this.AddressRepo.save(address);
        return await this.VotesRepo.save(vote);
    }

    async pendingVotes(): Promise<Votes[]> {
        return await this.VotesRepo.find({ where: { isPending: true } });
    }

    async getVoteId(id: number): Promise<Votes> {
        return await this.VotesRepo.findOneBy({ id: id });
    }
}
