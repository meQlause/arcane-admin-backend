import {
    BadRequestException,
    Injectable,
    NotFoundException,
    UnauthorizedException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Address } from 'src/entities/arcane/address.entity';
import { Discussions } from 'src/entities/arcane/discussion.entity';
import { Voters } from 'src/entities/arcane/voters.entity';
import { Votes } from 'src/entities/arcane/votes.entity';
import { Repository } from 'typeorm';
import { Transactional } from 'typeorm-transactional';
import { AddVoteDto } from './dto/add-vote-dto';
import { CreateVoteDto } from './dto/create-vote-dto';
import { LoggerService } from 'src/logger/logger.service';
import { WithdrawVoteDto } from './dto/withdraw-vote-dto';
import { Counter } from 'src/entities/arcane/counter.entity';

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
        private readonly VotersRepo: Repository<Voters>,
        @InjectRepository(Counter, 'arcane-connection')
        private readonly CounterRepo: Repository<Counter>,
        private readonly logger: LoggerService
    ) {}

    /**
     * Checks if an address is registered.
     *
     * @param address The address to check.
     * @returns Address object if registered, otherwise null.
     */
    private async isRegistered(owner: number): Promise<Address> {
        return await this.AddressRepo.findOne({ where: { id: owner } });
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
        this.logger.log('Getting address information.');
        const address: Address = await this.isRegistered(data.owner);
        if (!address) {
            this.logger.warn('Address is not registered.');
            throw new UnauthorizedException('Address is unregistered');
        }

        this.logger.log('Getting transaction information.');
        const discussion: Discussions = this.DiscussionRepo.create({});

        const vote_choice = data.votes.reduce(
            (obj, key) => ({ ...obj, [key]: 0 }),
            {}
        );

        const url = `https://eu.starton-ipfs.com/ipfs//${data.metadata}`;
        const options = {
            method: 'GET',
            headers: {
                'X-Api-Key': 'sk_live_00998243-feff-49f8-a092-8cb33d87e5c9',
            },
        };

        let resData: any = {};
        try {
            const response = await fetch(url, options);
            resData = await response.json();
        } catch (error) {
            console.error(error);
        }
        console.log(data.startEpoch + Number(resData.endEpoch));

        const vote: Votes = this.VotesRepo.create({
            id: data.id,
            startEpoch: data.startEpoch,
            metadata: data.metadata,
            endEpoch: data.startEpoch + Number(resData.endEpoch),
            title: resData.title,
            picture: resData.picture,
            description: resData.description,
            componentAddress: data.address,
            voteAddressCount: vote_choice,
            voteTokenAmount: vote_choice,
        });
        vote.discussion = discussion;
        vote.address = address;
        address.discussions = [discussion];

        const counter: Counter = await this.CounterRepo.findOne({
            where: { id: 1 },
        });
        counter.pending += 1;
        await this.DiscussionRepo.save(discussion);
        await this.AddressRepo.save(address);
        await this.CounterRepo.save(counter);

        this.logger.log('Vote created.');
        return await this.VotesRepo.save(vote);
    }

    /**
     * Retrieves all votes.
     *
     * @returns Promise<Votes[]> Array of votes.
     */
    async getVotes(page: number, limit: number = 10): Promise<Votes[]> {
        this.logger.log('Get Votes data.');
        const skip = (page - 1) * limit;
        return await this.VotesRepo.createQueryBuilder('votes')
            .leftJoinAndSelect('votes.address', 'address')
            .orderBy('votes.id', 'DESC')
            .skip(skip)
            .take(limit)
            .getMany();
    }

    /**
     * Retrieves a vote by its ID.
     *
     * @param id The ID of the vote.
     * @returns Promise<Votes> The vote.
     */
    async getVoteId(id: number): Promise<Votes> {
        this.logger.log('Get Votes data by ID.');
        return await this.VotesRepo.createQueryBuilder('votes')
            .leftJoinAndSelect('votes.address', 'address')
            .leftJoinAndSelect('votes.voters', 'voters')
            .where('votes.id = :id', { id })
            .getOne();
    }

    async getVoterData(id: number, nftId: number): Promise<Voters> {
        this.logger.log('Get Voter data by ID.');
        return await this.VotersRepo.createQueryBuilder('voters')
            .leftJoinAndSelect('voters.vote', 'votes')
            .where('votes.id = :id', { id })
            .andWhere('voters.AddressId = :nftId', { nftId })
            .getOne();
    }

    async getVotesById(id: number): Promise<Votes[]> {
        this.logger.log('Get Votes data by user ID.');
        return await this.VotesRepo.createQueryBuilder('votes')
            .leftJoinAndSelect('votes.address', 'address')
            .where('votes.address = :id', { id })
            .orderBy('votes.id', 'DESC')
            .getMany();
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
        this.logger.log('Getting Vote information.');
        const vote = await this.VotesRepo.createQueryBuilder('votes')
            .leftJoinAndSelect('votes.voters', 'voters')
            .where('votes.id = :voteId', { voteId: addVote.voteId })
            .getOne();

        this.logger.log('Getting Address information.');
        const address = await this.AddressRepo.findOne({
            where: { id: addVote.address },
        });
        if (!vote) {
            this.logger.fatal(`Vote doesn't exist.`);
            throw new BadRequestException('Vote not found');
        }

        const key = addVote.key;
        if (!(key in vote.voteAddressCount && key in vote.voteTokenAmount)) {
            this.logger.fatal(`Vote key doesn't exist.`);
            throw new BadRequestException('Key not found');
        }

        const voter = this.VotersRepo.create({
            AddressId: address.id,
            amount: addVote.tokenAmount,
            voter: address.address,
            title: vote.title,
            selected: key,
        });

        vote.voters.push(voter);
        vote.voteAddressCount[key] += 1;
        vote.voteTokenAmount[key] += addVote.tokenAmount;

        await Promise.all([
            this.VotesRepo.save(vote),
            this.VotersRepo.save(voter),
        ]);
        this.logger.log(`Voting Success.`);
        return voter;
    }

    @Transactional({ connectionName: 'arcane-datasource' })
    async withdrawVote(withdrawVote: WithdrawVoteDto): Promise<Voters> {
        this.logger.log('Getting Vote information.');
        this.logger.log('Get Votes data by ID.');
        const vote = await this.VotesRepo.createQueryBuilder('votes')
            .leftJoinAndSelect('votes.voters', 'voters')
            .where('votes.id = :voteId', { voteId: withdrawVote.voteId })
            .getOne();

        if (!vote) {
            throw new NotFoundException(
                `Voter with ID ${withdrawVote.addressId} not found in the voters of the vote with ID ${withdrawVote.voteId}`
            );
        }
        console.log(vote);
        const voterUpdate = vote.voters.find(
            (voter) =>
                Number(voter.AddressId) === Number(withdrawVote.addressId)
        );
        console.log(voterUpdate);
        voterUpdate.isWithdrawed = true;

        return await this.VotersRepo.save(voterUpdate);
    }

    async voterData(id: number): Promise<Voters[]> {
        return await this.VotersRepo.createQueryBuilder('voters')
            .leftJoinAndSelect('voters.vote', 'votes')
            .where('voters.AddressId = :id', { id })
            .orderBy('voters.id', 'DESC')
            .getMany();
    }

    async status(status: string): Promise<number> {
        const { pending, active, reject } = await this.CounterRepo.findOne({
            where: { id: 1 },
        });
        const select = {
            pending: pending,
            active: active,
            reject: reject,
        };
        console.log(select[status]);
        return select[status];
    }
}
