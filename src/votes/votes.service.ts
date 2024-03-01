import {
    BadRequestException,
    Injectable,
    UnauthorizedException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Address } from 'src/entities/arcane/address.entity';
import { Discussions } from 'src/entities/arcane/discussion.entity';
import { Voters } from 'src/entities/arcane/voters.entity';
import { Votes } from 'src/entities/arcane/votes.entity';
import { getVoteComponentAddress } from 'src/helpers/RadixAPI';
import { Repository } from 'typeorm';
import { Transactional } from 'typeorm-transactional';
import { AddVoteDto } from './dto/add-vote-dto';
import { CreateVoteDto } from './dto/create-vote-dto';

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

    /**
     * Checks if an address is registered.
     *
     * @param address The address to check.
     * @returns Address object if registered, otherwise null.
     */
    private async isRegistered(address: string): Promise<Address> {
        return await this.AddressRepo.findOne({ where: { address: address } });
    }

    /**
     * Creates a new vote.
     *
     * @param data Data for creating the vote.
     * @returns Promise<Votes> The created vote.
     * @throws UnauthorizedException if the address is unregistered.
     */
    @Transactional({ connectionName: 'arcane-datasource' })
    async createVote(data: CreateVoteDto): Promise<Votes> {
        const address: Address = await this.isRegistered(data.address);
        if (!address) {
            throw new UnauthorizedException('Address is unregistered');
        }

        const component = await getVoteComponentAddress(data.txId.trim());

        const voteChoice = data.votes.reduce(
            (obj, key) => ({ ...obj, [key]: 0 }),
            {}
        );
        const photos = data.photos.reduce(
            (obj, key, index) => ({ ...obj, [key]: index }),
            {}
        );

        const discussion: Discussions = this.DiscussionRepo.create();
        const vote: Votes = this.VotesRepo.create({
            startDate: data.startDate,
            endDate: data.endDate,
            title: data.title,
            description: data.description,
            isPending: true,
            voteTokenAmount: voteChoice,
            voteAddressCount: voteChoice,
            componentAddress: component,
            photos: photos,
            discussion: discussion,
            address: address,
        });

        address.discussions = [discussion];

        await this.DiscussionRepo.save(discussion);
        await this.AddressRepo.save(address);

        return await this.VotesRepo.save(vote);
    }

    /**
     * Retrieves all votes.
     *
     * @returns Promise<Votes[]> Array of votes.
     */
    async getVotes(): Promise<Votes[]> {
        return await this.VotesRepo.createQueryBuilder('votes')
            .leftJoinAndSelect('votes.address', 'address')
            .getMany();
    }

    /**
     * Retrieves a vote by its ID.
     *
     * @param id The ID of the vote.
     * @returns Promise<Votes> The vote.
     */
    async getVoteId(id: number): Promise<Votes> {
        return await this.VotesRepo.createQueryBuilder('votes')
            .leftJoinAndSelect('votes.address', 'address')
            .leftJoinAndSelect('votes.voters', 'voters')
            .where('votes.id = :id', { id })
            .getOne();
    }

    /**
     * Adds a vote.
     *
     * @param addVote Data for adding the vote.
     * @returns Promise<Voters> The added vote.
     * @throws UnauthorizedException if the vote is not found or the key is not found.
     */
    @Transactional({ connectionName: 'arcane-datasource' })
    async addVote(addVote: AddVoteDto): Promise<Voters> {
        const vote = await this.VotesRepo.findOne({
            where: { id: addVote.voteId },
        });
        if (!vote) {
            throw new UnauthorizedException('Vote not found');
        }

        const key = addVote.key;
        if (!(key in vote.voteAddressCount && key in vote.voteTokenAmount)) {
            throw new BadRequestException('Key not found');
        }

        const voter = this.VotersRepo.create({
            amount: addVote.tokenAmount,
            voter: addVote.address,
            vote: vote,
            selected: key,
        });

        vote.voteAddressCount[key] += 1;
        vote.voteTokenAmount[key] += addVote.tokenAmount;

        await Promise.all([
            this.VotesRepo.save(vote),
            this.VotersRepo.save(voter),
        ]);

        return voter;
    }
}
