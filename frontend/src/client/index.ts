import { ChoiceAction, DetailedSpace, Proposal, ProposalState, Space, Token, Vote } from './types';
import VitasensusContract from '../contracts/Vitasensus';
import { decodeBytes32ToString, encodeStringToBytes32 } from '../utils/strings';
import { ViteBalanceInfo } from '../utils/types';
import { BigNumber } from 'bignumber.js';
import { ViteAPI } from '@vite/vitejs/distSrc/viteAPI/type';
import { getTokenInfo } from '../utils/viteScripts';

type PaginationOptions = {
	first?: number;
	skip?: number;
	limit?: number;
};

type AuthorOptions = {
	author?: string;
};

export class SensusClient {
	constructor(
		private readonly callContract: (
			contract: typeof VitasensusContract,
			methodName: string,
			params?: any[],
			tokenId?: string,
			amount?: string
		) => Promise<object>,
		private readonly scanEvents: (
			contract: typeof VitasensusContract,
			fromHeight: string,
			eventName: string
		) => Promise<object>,
		private readonly queryContract: (
			contract: typeof VitasensusContract,
			methodName: string,
			params: any[]
		) => Promise<object[] | Array<object>[]>,
		private readonly viteBalanceInfo: ViteBalanceInfo,
		private readonly viteApi: ViteAPI,
		private readonly address?: string
	) {}

	private _cachedSpaces: { [id: number]: DetailedSpace } = {};
	private _cachedProposals: { [spaceId: number]: { [proposalId: number]: Proposal } } = {};
	private _cachedTokens: { [id: string]: Token } = {};
	private _cachedVotes: {
		[spaceId: number]: { [proposalId: number]: { [author: string]: Vote } };
	} = {};

	private async _cacheSpaces(spaces: DetailedSpace[]): Promise<void> {
		for (const space of spaces) {
			this._cachedSpaces[space.id] = space;
		}
	}

	private async _cacheProposals(spaceId: number, proposals: Proposal[]): Promise<void> {
		!this._cachedProposals[spaceId] && (this._cachedProposals[spaceId] = {});
		for (const proposal of proposals) {
			this._cachedProposals[spaceId][proposal.id] = proposal;
		}
	}

	private async _cacheVotes(spaceId: number, proposalId: number, votes: Vote[]): Promise<void> {
		!this._cachedVotes[spaceId] && (this._cachedVotes[spaceId] = {});
		!this._cachedVotes[spaceId][proposalId] && (this._cachedVotes[spaceId][proposalId] = {});
		for (const vote of votes) {
			this._cachedVotes[spaceId][proposalId][vote.author] = vote;
		}
	}

	async getProposals(
		spaceId: number,
		{ skip = 0, limit = 10 }: PaginationOptions & AuthorOptions
	): Promise<Proposal[]> {
		let proposals = new Array<Proposal>();
		if (skip + limit > Object.keys(this._cachedProposals[spaceId] ?? {}).length) {
			try {
				const proposalCountResult = (await this.queryContract(
					VitasensusContract,
					'getSpaceProposalsCount',
					[spaceId]
				)) as unknown as string[];
				const proposalCount = new BigNumber(proposalCountResult[0]).toNumber();

				for (let i = skip; i < skip + limit && i < proposalCount; i++) {
					const proposal = await this.getProposal(spaceId, i);
					proposal && proposals.push(proposal);
				}
			} catch (e) {
				console.error(e);
			}
		}
		if (!proposals.length) {
			proposals = Object.values(this._cachedProposals[spaceId]).slice(skip, skip + limit);
		}
		return proposals;
	}

	async getProposal(spaceId: number, id: number): Promise<Proposal | null> {
		if (
			this._cachedProposals[spaceId] &&
			this._cachedProposals[spaceId][id] &&
			this._cachedProposals[spaceId][id].choices
		)
			return this._cachedProposals[spaceId][id];
		const result = (await this.queryContract(VitasensusContract, 'getSpaceProposal', [
			spaceId,
			id,
		])) as object[] as unknown[] as Array<string | Array<string>>;
		const [
			title,
			description,
			author,
			startTime,
			endTime,
			choices,
			choicesExecutors,
			choicesData,
			votes,
		] = result;
		await this.getSpace(spaceId);
		console.log('getSpaceProposal result', result);
		console.log(votes);

		const proposal = new Proposal({
			id: id,
			title: title as string,
			description: description as string,
			choices: (choices as Array<string>).map(decodeBytes32ToString),
			author: author as string,
			end: Number.parseInt(endTime as string),
			start: Number.parseInt(startTime as string),
			spaceId,
			passActions: (choicesExecutors as Array<string>).map((executor, index) => ({
				executor,
				data: (choicesData as Array<string>)[index],
				choice: (choices as Array<string>)[index],
			})),
			choicesVotesCounts: (votes as Array<string>).map((e) => Number.parseInt(e)),
			state:
				Number.parseInt(endTime as string) > Date.now()
					? ProposalState.closed
					: ProposalState.active,
			space: this._cachedSpaces[spaceId],
		});
		console.log(proposal);

		await this._cacheProposals(spaceId, [proposal]);
		return proposal;
	}

	async loadSpaceDescription(spaceId: number): Promise<void> {}

	async loadSpaceMembers(spaceId: number): Promise<void> {}

	async loadSpaceAdmins(spaceId: number): Promise<void> {}

	async loadTokenDetails(tokenId: string): Promise<void> {
		const tokenInfo = await getTokenInfo(this.viteApi, tokenId);
		console.log(tokenInfo);
		this._cachedTokens[tokenId] = {
			name: tokenInfo.tokenName,
			symbol: tokenInfo.tokenSymbol,
			decimals: tokenInfo.decimals,
			id: tokenInfo.tokenId,
		};
	}

	private getToken(tokenId: string, decimals?: string): Token {
		const token = {
			...(this._cachedTokens[tokenId] ?? {
				id: tokenId,
				name: '',
				symbol: '',
			}),
		};
		if (decimals) {
			token.decimals = Number.parseInt(decimals);
		}
		return token;
	}

	async getSpaces({ skip = 0, limit = 10 }: PaginationOptions & AuthorOptions): Promise<Space[]> {
		let spaces = [];

		if (skip + limit > Object.keys(this._cachedSpaces).length)
			try {
				const result = (await this.queryContract(VitasensusContract, 'getSpaces', [
					skip,
					limit,
				])) as Array<string>[];

				for (let i = 0; i < result[0].length; i++) {
					const name = result[0][i];
					const tokenId = result[1][i];
					const avatar = result[2][i];
					const website = result[3][i];
					const memberCount = Number.parseInt(result[4][i]);

					const space: DetailedSpace = {
						id: skip + i,
						name: decodeBytes32ToString(name),
						avatar: decodeBytes32ToString(avatar),
						description: '',
						website: decodeBytes32ToString(website),
						members: [],
						admins: [],
						isPrivate: false,
						memberCount: memberCount,
						token: this.getToken(tokenId),
					};
					spaces.push(space);
				}
				this._cacheSpaces(spaces);
			} catch (e) {
				console.error(e);
			}
		if (!spaces.length)
			spaces = Object.keys(this._cachedSpaces)
				.slice(skip, skip + limit)
				.map((id) => this._cachedSpaces[Number.parseInt(id)]);
		return spaces;
	}

	async getUserSpaces(): Promise<Space[]> {
		let spaces = [];

		if (this.address)
			try {
				const result = (await this.queryContract(VitasensusContract, 'getUserSpaces', [
					this.address,
				])) as Array<string>[];

				for (let i = 0; i < result[0].length; i++) {
					const id = Number.parseInt(result[0][i]);
					const name = result[1][i];
					const avatar = result[2][i];

					const space: Space = {
						id: id,
						name: decodeBytes32ToString(name),
						avatar: decodeBytes32ToString(avatar),
						isPrivate: false,
						memberCount: 0,
						token: {
							decimals: 0,
							id: '',
							name: '',
							symbol: '',
						},
					};
					spaces.push(space);
				}
			} catch (e) {
				console.error(e);
			}

		return spaces;
	}

	async getSpace(id: number): Promise<DetailedSpace | null> {
		console.log('getSpace', id);

		if (this._cachedSpaces[id] && this._cachedSpaces[id].description) return this._cachedSpaces[id];
		const result = (await this.queryContract(VitasensusContract, 'getSpaceExternal', [
			id,
		])) as object[] as unknown[] as string[];
		console.log(result);

		const [name, description, token, avatar, website, memberCount, decimals] = result;
		await this.loadTokenDetails(token);
		console.log('decimals', decimals);

		const space: DetailedSpace = {
			id: id,
			name: decodeBytes32ToString(name),
			description: description,
			avatar: decodeBytes32ToString(avatar),
			website: decodeBytes32ToString(website),
			members: [],
			admins: [],
			isPrivate: false,
			memberCount: Number.parseInt(memberCount),
			token: this.getToken(token, decimals),
		};
		await this._cacheSpaces([space]);
		console.log(space);

		return space;
	}

	async getVotes(
		spaceId: number,
		proposal: number,
		{ skip = 0, limit = 10 }: PaginationOptions & AuthorOptions
	): Promise<Vote[]> {
		let votes = new Array<Vote>();
		if (
			skip + limit >
			Object.keys((this._cachedVotes[spaceId] && this._cachedVotes[spaceId][proposal]) ?? {}).length
		) {
			try {
				const result = (await this.queryContract(VitasensusContract, 'getSpaceProposalVotes', [
					spaceId,
					proposal,
					skip,
					limit,
				])) as Array<string | Array<string>>[];
				console.log('client get votes', result);

				const [voters, votess] = result;
				for (let i = 0; i < result[0].length; i++) {
					const votes_ = !votess.length
						? []
						: (votess[i + 1] as Array<string>).map((e) => Number.parseInt(e));
					const vote: Vote = {
						proposal: proposal,
						amount: votes_.reduce((a, b) => a + b, 0),
						choices: votes_,
						space: spaceId,
						author: voters[i] as string,
						id: skip + i,
					};
					votes.push(vote);
				}
				this._cacheVotes(spaceId, proposal, votes);
			} catch (e) {
				console.error(e);
			}
		}
		if (!votes.length) {
			votes = Object.values(
				this._cachedVotes[spaceId] && this._cachedVotes[spaceId][proposal]
			).slice(skip, skip + limit);
		}
		return votes;
	}

	getVotingPower(spaceId: number): number {
		if (!this.viteBalanceInfo) return 0;

		const balances = this.viteBalanceInfo.balance;
		const tokenId = this._cachedSpaces[spaceId]?.token.id;

		if (!balances.balanceInfoMap) return 0;

		const token = balances.balanceInfoMap[tokenId]?.tokenInfo;
		if (!token) return 0;
		const balance = balances.balanceInfoMap[tokenId]?.balance;
		if (!balance) return 0;
		return new BigNumber(balance, 10).idiv(Math.pow(10, token.decimals), 10).toNumber();
	}

	async createSpace(
		name: string,
		description: string,
		spaceToken: string,
		avatar: string,
		website: string
	): Promise<any> {
		await this.loadTokenDetails(spaceToken);
		const result = (await this.callContract(VitasensusContract, 'createSpace', [
			encodeStringToBytes32(name),
			description,
			spaceToken,
			encodeStringToBytes32(avatar),
			encodeStringToBytes32(website),
			this.getToken(spaceToken).decimals,
		])) as any;
		console.log("createSpace call contract", result);

		const events: any[] = (await this.scanEvents(
			VitasensusContract,
			result.height,
			'SpaceCreated'
		)) as any[];
		const event = events[events.length - 1] as any;
		const spaceId = event.returnValues.id;

		const space = await this.getSpace(spaceId);
		return space;
	}

	async createProposal({
		actions,
		choices,
		description,
		end,
		space,
		start,
		title,
	}: {
		space: number;
		title: string;
		description: string;
		choices: string[];
		actions: ChoiceAction[];
		end: number;
		start: number;
		link?: string;
	}): Promise<Proposal> {
		const result = (await this.callContract(VitasensusContract, 'createProposal', [
			space,
			title,
			description,
			start,
			end,
			choices.map((choice) => encodeStringToBytes32(choice)),
			actions.map((action) => action.executor),
			actions.map((action) => action.data.padEnd(64, '0')),
		])) as any;
		console.log(result);

		const events: any[] = (await this.scanEvents(
			VitasensusContract,
			result.height,
			'ProposalCreated'
		)) as any[];
		console.log(events);

		const event = events[events.length - 1] as any;
		const proposalId = event.returnValues.id;
		const proposal = await this.getProposal(space, Number.parseInt(proposalId));

		return proposal!;
	}

	async vote(spaceId: number, proposal: number, choiceAmounts: number[]): Promise<void> {
		console.log('vote', spaceId, proposal, choiceAmounts);

		await this.getSpace(spaceId);
		await this.callContract(
			VitasensusContract,
			'voteOnProposal',
			[spaceId, proposal, choiceAmounts.map((amount) => amount.toString())],
			this._cachedSpaces[spaceId].token.id,
			new BigNumber(choiceAmounts.reduce((a, b) => a + b, 0))
				.multipliedBy(Math.pow(10, this._cachedSpaces[spaceId].token.decimals))
				.toString()
		);
	}

	async joinSpace(spaceId: number): Promise<void> {
		await this.callContract(VitasensusContract, 'joinSpace', [spaceId]);
	}

	async redeemTokens(spaceId: number, proposalId: number): Promise<void> {
		this.address &&
			(await this.callContract(VitasensusContract, 'redeemVotedTokens', [
				spaceId,
				proposalId,
				this.address,
			]));
	}

	async executeProposal(spaceId: number, proposalId: number): Promise<void> {
		const result = await this.callContract(VitasensusContract, 'executeProposal', [
			spaceId,
			proposalId,
		]);
		console.log(result);
	}

	async isProposalExecuted(spaceId: number, proposalId: number): Promise<boolean> {
		console.log('isProposalExecuted', spaceId, proposalId);

		const result = (await this.queryContract(VitasensusContract, 'isProposalExecuted', [
			spaceId,
			proposalId,
		])) as any;

		return result[0] === '1';
	}
}
