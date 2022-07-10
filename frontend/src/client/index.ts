import { DetailedSpace, Proposal, Space, Token, Vote } from './types';
import VitasensusContract from '../contracts/Vitasensus';
import { decodeBytes32ToString, encodeStringToBytes32 } from '../utils/strings';

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
		) => Promise<object[] | Array<object>[]>
	) {}

	private _cachedSpaces: { [id: number]: DetailedSpace } = {};
	private _cachedProposals: { [spaceId: number]: { [proposalId: number]: Proposal } } = {};
	private _cachedTokens: { [id: string]: Token } = {};

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

	async getProposals(
		spaceId: number,
		{ skip = 0, limit = 10 }: PaginationOptions & AuthorOptions
	): Promise<Proposal[]> {
		let proposals = new Array<Proposal>();
		if (skip + limit > Object.keys(this._cachedProposals[spaceId] ?? {}).length) {
			try {
				const events = await this.scanEvents(VitasensusContract, '0', 'ProposalCreated');
				console.log(events);

				// for (const event of events) {
				// 	const spaceId = Number.parseInt(event.returnValues.spaceId);
				// 	const proposalId = Number.parseInt(event.returnValues.proposalId);
				// 	const name = decodeBytes32ToString(event.returnValues.name);
				// 	const description = decodeBytes32ToString(event.returnValues.description);
				// 	const author = decodeBytes32ToString(event.returnValues.author);
				// 	const tokenId = event.returnValues.tokenId;
				// 	const amount = event.returnValues.amount;
				// 	const space = this._cachedSpaces[spaceId];
				// 	if (!space) continue;
				// 	const proposal: Proposal = {
				// 		id: proposalId,
				// 		name: name,
				// 		description: description,
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
		return null;
	}

	async loadSpaceDescription(spaceId: number): Promise<void> {}

	async loadSpaceMembers(spaceId: number): Promise<void> {}

	async loadSpaceAdmins(spaceId: number): Promise<void> {}

	async loadTokenDetails(tokenId: number): Promise<void> {}

	private getToken(tokenId: string): Token {
		return (
			this._cachedTokens[tokenId] ?? {
				id: tokenId,
				name: '',
				symbol: '',
			}
		);
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

	async getSpace(id: number): Promise<DetailedSpace | null> {
		if (this._cachedSpaces[id]) return this._cachedSpaces[id];
		const result = (await this.queryContract(VitasensusContract, 'getSpaceExternal', [
			id,
		])) as object[] as unknown[] as string[];
		const [name, description, token, avatar, website, memberCount] = result;
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
			token: this.getToken(token),
		};
		await this._cacheSpaces([space]);
		return space;
	}

	async getVotes(
		spaceId: number,
		proposal: number,
		{}: PaginationOptions & AuthorOptions
	): Promise<Vote[]> {
		return [];
	}

	async getVotingPower(address: string, spaceId: number): Promise<number> {
		return 0;
	}

	async getScores(spaceId: number, proposal: number): Promise<number[]> {
		return [];
	}

	async createSpace(
		name: string,
		description: string,
		spaceToken: string,
		avatar: string,
		website: string
	): Promise<DetailedSpace> {
		await this.callContract(VitasensusContract, 'createSpace', [
			encodeStringToBytes32(name),
			description,
			spaceToken,
			encodeStringToBytes32(avatar),
			encodeStringToBytes32(website),
		]);
		const events: any[] = (await this.scanEvents(VitasensusContract, '0', 'SpaceCreated')) as any[];
		console.log(events);
		const event = events[events.length - 1] as any;
		const spaceId = event.id;
		const result2 = (await this.queryContract(VitasensusContract, 'getSpaceExternal', [
			spaceId,
		])) as object[] as unknown[] as string[];
		const [name2, description2, token2, avatar2, website2] = result2;
		const space: DetailedSpace = {
			id: spaceId,
			name: decodeBytes32ToString(name2),
			description: description2,
			avatar: decodeBytes32ToString(avatar2),
			website: decodeBytes32ToString(website2),
			members: [],
			admins: [],
			isPrivate: false,
			memberCount: 0,
			token: this.getToken(token2),
		};
		return space;
	}

	async createProposal({}: {
		space: number;
		title: string;
		description: string;
		choices: string[];
		end: number;
		link?: string;
	}): Promise<Proposal> {
		throw new Error('Method not implemented.');
	}

	async vote(spaceId: number, proposal: number, choiceAmounts: string[]): Promise<Vote> {
		throw new Error('Method not implemented.');
	}

	async joinSpace(spaceId: number): Promise<void> {
		await this.callContract(VitasensusContract, 'joinSpace', [spaceId]);
	}
}
