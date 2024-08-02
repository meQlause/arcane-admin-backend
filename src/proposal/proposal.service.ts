import {
    BadRequestException,
    Injectable,
    NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Address } from 'src/entities/arcane/address.entity';
import { Discussions } from 'src/entities/arcane/discussion.entity';
import { Voters } from 'src/entities/arcane/voters.entity';
import { Proposal } from 'src/entities/arcane/proposal.entity';
import { In, LessThanOrEqual, Repository } from 'typeorm';
import { Transactional } from 'typeorm-transactional';
import { AddVoteDto } from './dto/add-vote-dto';
import { WithdrawVoteDto } from './dto/withdraw-vote-dto';
import { Counter } from 'src/entities/arcane/counter.entity';
import { Status } from 'src/custom';
import { CreateProposalDto } from './dto/create-proposal-dto';
import envConfig from 'src/config/config';

@Injectable()
export class ProposalService {
    constructor(
        @InjectRepository(Address, 'arcane-connection')
        private readonly AddressRepo: Repository<Address>,
        @InjectRepository(Proposal, 'arcane-connection')
        private readonly ProposalRepo: Repository<Proposal>,
        @InjectRepository(Discussions, 'arcane-connection')
        private readonly DiscussionRepo: Repository<Discussions>,
        @InjectRepository(Voters, 'arcane-connection')
        private readonly VotersRepo: Repository<Voters>,
        @InjectRepository(Counter, 'arcane-connection')
        private readonly CounterRepo: Repository<Counter>
    ) {}

    /**
     * Checks if an address is registered.
     *
     * @param address The address to check.
     * @returns Address object if registered, otherwise null.
     */
    async validateAddress(owner: number): Promise<Address> {
        return await this.AddressRepo.findOne({ where: { id: owner } });
    }

    async getDataFromIpfs(id: string): Promise<any> {
        const url = `https://eu.starton-ipfs.com/ipfs//${id}`;

        const options = {
            method: 'GET',
            headers: {
                'X-Api-Key': envConfig.ipfsKey,
            },
        };

        try {
            const response = await fetch(url, options);
            return await response.json();
        } catch (error) {
            console.error(error);
        }
    }
    /**
     * Creates a new vote.
     *
     * @param data Data for creating the vote.
     * @returns Promise<Proposal> The created vote.
     * @throws UnauthorizedException if the address is unregistered.
     */
    @Transactional({ connectionName: 'arcane-datasource' })
    async createProposal(
        data: CreateProposalDto,
        addressData: Address
    ): Promise<Proposal> {
        const discussion: Discussions = this.DiscussionRepo.create({});

        const vote_choice = data.votes.reduce(
            (obj, key) => ({ ...obj, [key]: 0 }),
            {}
        );

        const resData = await this.getDataFromIpfs(data.metadata);

        const proposal: Proposal = this.ProposalRepo.create({
            id: data.id,
            start_epoch: data.start_epoch,
            end_epoch: data.end_epoch,
            metadata: data.metadata,
            component_address: data.address,
            title: resData.title,
            created_by: resData.createdBy,
            picture: resData.picture,
            description: resData.description,
            vote_address_count: vote_choice,
            vote_token_amount: vote_choice,
            status: Status.PENDING,
        });
        proposal.discussion = discussion;
        proposal.address = addressData;
        addressData.discussions = [discussion];

        const counter: Counter = await this.CounterRepo.findOne({
            where: { id: 1 },
        });

        counter.pending += 1;

        await this.DiscussionRepo.save(discussion);
        await this.AddressRepo.save(addressData);
        await this.CounterRepo.save(counter);

        return await this.ProposalRepo.save(proposal);
    }

    /**
     * Retrieves all proposal.
     *
     * @returns Promise<Proposal[]> Array of proposal.
     */
    async getProposalList(
        page: number,
        status: string[],
        limit: number = 10
    ): Promise<Proposal[]> {
        const skip = (page - 1) * limit;
        return await this.ProposalRepo.createQueryBuilder('proposal')
            .leftJoinAndSelect('proposal.address', 'address')
            .where('proposal.status IN (:...status)')
            .setParameter('status', status)
            .orderBy('proposal.id', 'DESC')
            .skip(skip)
            .take(limit)
            .getMany();
    }

    private async getCounterValues() {
        const counterRes = await this.CounterRepo.findOne({
            where: { id: 1 },
        });
        return {
            counterRes,
            select: {
                pending: counterRes.pending,
                active: counterRes.active,
                rejected: counterRes.rejected,
                closed: counterRes.closed,
            },
        };
    }

    private async updateCounterValues(select: any, counterRes: any) {
        counterRes.pending = select.pending;
        counterRes.active = select.active;
        counterRes.rejected = select.rejected;
        counterRes.closed = select.closed;
        await this.CounterRepo.save(counterRes);
    }

    private async updateProposalStatus(
        id: number,
        status: Status,
        select: any
    ) {
        const proposal = await this.ProposalRepo.findOne({
            where: { id },
        });
        proposal.status = status;
        select[status] += 1;
        select[Status.PENDING] -= 1;
        await this.ProposalRepo.save(proposal);
        return proposal;
    }

    private async closeActiveProposals(current_epoch: number, select: any) {
        const proposals = await this.ProposalRepo.find({
            where: {
                end_epoch: LessThanOrEqual(Number(current_epoch)),
                status: In([Status.ACTIVE, Status.PENDING]),
            },
        });
        console.log(proposals);

        proposals.forEach((proposal) => {
            select[proposal.status] -= 1;
            select[Status.CLOSED] += 1;
            proposal.status = Status.CLOSED;
        });

        await Promise.all(
            proposals.map((proposal) => this.ProposalRepo.save(proposal))
        );
        return proposals;
    }

    @Transactional({ connectionName: 'arcane-datasource' })
    async changeStatus(
        id: number,
        status: Status
    ): Promise<Proposal | Proposal[]> {
        const { counterRes, select } = await this.getCounterValues();
        if (status !== Status.CLOSED) {
            const proposal = await this.updateProposalStatus(
                id,
                status,
                select
            );
            await this.updateCounterValues(select, counterRes);
            return proposal;
        }

        // if status is 'closed', the id variable will become current epoch
        const proposals = await this.closeActiveProposals(id, select);

        try {
            await this.updateCounterValues(select, counterRes);
        } catch (error) {
            throw new BadRequestException(error);
        }

        return proposals;
    }

    /**
     * Retrieves a proposal by its ID.
     *
     * @param id The ID of tproposal.
     * @returns Promise<Proposal> Tproposal.
     */
    async getProposalDetail(id: number): Promise<Proposal> {
        return await this.ProposalRepo.createQueryBuilder('proposal')
            .leftJoinAndSelect('proposal.address', 'address')
            .leftJoinAndSelect('proposal.voters', 'voters')
            .where('proposal.id = :id', { id })
            .getOne();
    }

    async getVoterData(id: number, nftId: bigint): Promise<Voters> {
        return await this.VotersRepo.createQueryBuilder('voters')
            .leftJoinAndSelect('voters.proposal', 'proposal')
            .where('proposal.id = :id', { id })
            .andWhere('voters.address_id = :nftId', { nftId })
            .getOne();
    }

    async getProposalListByUserId(id: number): Promise<Proposal[]> {
        return await this.ProposalRepo.createQueryBuilder('proposal')
            .leftJoinAndSelect('proposal.address', 'address')
            .where('proposal.address = :id', { id })
            .orderBy('proposal.id', 'DESC')
            .getMany();
    }

    private async votedData(
        addressId: number,
        voteId: number
    ): Promise<Voters> {
        const votedData = await this.VotersRepo.createQueryBuilder('voters')
            .leftJoinAndSelect('voters.proposal', 'proposal')
            .where('voters.address_id = :addressId', {
                addressId: addressId,
            })
            .where('proposal.id = :voteId', { voteId: voteId })
            .getOne();
        return votedData;
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
        const isAlreadyVoted = await this.votedData(
            addVote.address,
            addVote.proposal_id
        );

        if (isAlreadyVoted) {
            throw new BadRequestException('Already voted');
        }

        const proposal = await this.ProposalRepo.createQueryBuilder('proposal')
            .leftJoinAndSelect('proposal.voters', 'voters')
            .where('proposal.id = :proposalId', {
                proposalId: addVote.proposal_id,
            })
            .getOne();

        if (!proposal) {
            throw new BadRequestException('Proposal not found');
        }

        const address = await this.AddressRepo.findOne({
            where: { id: addVote.address },
        });
        if (!address) {
            throw new BadRequestException('Address is not registered');
        }

        if (
            !(
                addVote.key in proposal.vote_address_count &&
                addVote.key in proposal.vote_token_amount
            )
        ) {
            throw new BadRequestException('Key not found');
        }

        const voter = this.VotersRepo.create({
            address_id: address.id,
            amount: addVote.token_amount,
            voter: address.address,
            title: proposal.title,
            selected: addVote.key,
        });

        proposal.voters.push(voter);
        proposal.vote_address_count[addVote.key] += 1;
        proposal.vote_token_amount[addVote.key] += addVote.token_amount;

        await Promise.all([
            this.ProposalRepo.save(proposal),
            this.VotersRepo.save(voter),
        ]);
        return voter;
    }

    @Transactional({ connectionName: 'arcane-datasource' })
    async withdrawVote(withdrawVote: WithdrawVoteDto): Promise<Voters> {
        const proposal = await this.ProposalRepo.createQueryBuilder('proposal')
            .leftJoinAndSelect('proposal.voters', 'voters')
            .where('proposal.id = :proposalId', {
                proposalId: withdrawVote.proposal_id,
            })
            .getOne();

        if (!proposal) {
            throw new NotFoundException(
                `Voter with ID ${withdrawVote.address_id} not found in the voters of the vote with ID ${withdrawVote.proposal_id}`
            );
        }

        const voterUpdate = proposal.voters.find(
            (voter) =>
                Number(voter.address_id) === Number(withdrawVote.address_id)
        );

        voterUpdate.is_withdrawed = true;

        return await this.VotersRepo.save(voterUpdate);
    }

    async voterData(id: number): Promise<Voters[]> {
        return await this.VotersRepo.createQueryBuilder('voters')
            .leftJoinAndSelect('voters.proposal', 'proposal')
            .where('voters.address_id = :id', { id })
            .orderBy('voters.id', 'DESC')
            .getMany();
    }

    async count(status: string[]): Promise<number> {
        const { pending, active, rejected, closed } =
            await this.CounterRepo.findOne({
                where: { id: 1 },
            });

        const select = {
            pending: pending,
            active: active,
            rejected: rejected,
            closed: closed,
        };

        const total = status.reduce((acc, curr) => {
            return (acc += select[curr]);
        }, 0);

        return total;
    }
}
