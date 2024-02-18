import { Injectable, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Address } from 'src/entities/arcane/address.entity';
import { Votes } from 'src/entities/arcane/votes.entity';
import { Repository } from 'typeorm';
import { CreateVoteDto } from './dto/create-vote-dto';
import { Transactional } from 'typeorm-transactional';
import { Discussions } from 'src/entities/arcane/discussion.entity';
import { getVoteComponentAddress } from 'src/helpers/RadixAPI';
import { Voters } from 'src/entities/arcane/voters.entity';
import { AddVoteDto } from './dto/add-vote-dto';

@Injectable()
export class VotesService {
    constructor(
        @InjectRepository(Address, 'arcane-connection')
        private readonly AddressRepo: Repository<Address>,
        @InjectRepository(Votes, 'arcane-connection')
        private readonly VotesRepo: Repository<Votes>,
        @InjectRepository(Discussions, 'arcane-connection')
        private readonly DiscussionRepo: Repository<Discussions>,
        @InjectRepository(Voters, 'arcane-connection')
        private readonly VotersRepo: Repository<Voters>
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

        const component = await getVoteComponentAddress(data.txId.trim());

        const vote: Votes = this.VotesRepo.create({
            // startDate: data.startDate,
            // endDate: data.endDate,
            title: data.title,
            description: data.description,
            isPending: true,
            voteTokenAmount: vote_choice,
            voteAddressCount: vote_choice,
            componentAddress: component,
        });

        vote.discussion = discussion;
        vote.address = address;
        address.discussions = [discussion];

        await this.DiscussionRepo.save(discussion);
        await this.AddressRepo.save(address);

        return await this.VotesRepo.save(vote);
    }

    async getVotes(): Promise<Votes[]> {
        return await this.VotesRepo.createQueryBuilder('votes')
            .leftJoinAndSelect('votes.address', 'address')
            .getMany();
    }

    async getVoteId(id: number): Promise<Votes> {
        return await this.VotesRepo.createQueryBuilder('votes')
            .leftJoinAndSelect('votes.address', 'address')
            .leftJoinAndSelect('votes.voters', 'voters')
            .where('votes.id = :id', { id })
            .getOne();
    }

    @Transactional({ connectionName: 'arcane-datasource' })
    async addVote(addVote: AddVoteDto): Promise<Voters> {
        const vote = await this.VotesRepo.findOne({
            where: { id: addVote.voteId },
        });
        if (!vote) {
            throw new UnauthorizedException('vote not found');
        }
        const totalAddress = vote.voteAddressCount[addVote.key];
        if (totalAddress) {
            throw new UnauthorizedException('key not found');
        }
        const totalToken = vote.voteTokenAmount[addVote.key];
        if (totalToken) {
            throw new UnauthorizedException('key not found');
        }
        const voter = this.VotersRepo.create({
            amount: addVote.tokenAmount,
            voter: addVote.address,
        });
        voter.vote = vote;
        voter.selected = addVote.key;
        vote.voteAddressCount[addVote.key] += 1;
        vote.voteTokenAmount[addVote.key] += addVote.tokenAmount;
        await this.VotesRepo.save(vote);
        return await this.VotersRepo.save(voter);
    }
}
