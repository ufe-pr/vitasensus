import {
	ChoiceAction,
	DetailedSpace,
	Proposal,
	ProposalState,
	Space,
	SpaceSettings,
	Token,
	Vote,
} from './types';
import VitasensusContract from '../contracts/Vitasensus';
import { decodeBytes32ToString, encodeStringToBytes32 } from '../utils/strings';
import { BigNumber } from 'bignumber.js';
import { ViteAPI } from '@vite/vitejs/distSrc/viteAPI/type';
import { getTokenInfo } from '../utils/viteScripts';
import axios from 'axios';

const ViteTokenId = 'tti_5649544520544f4b454e6e40';

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
		private readonly serverViteApi: ViteAPI,
		private readonly viteApi: ViteAPI,
		private readonly address?: string,
		private readonly signMessage?: (
			message: string
		) => Promise<{ signature: string; publicKey: string }>,
		private readonly vitasensusServerURL?: string
	) {}

	private _cachedSpaces: { [id: number]: DetailedSpace } = {};
	private _cachedSpacesSettings: { [id: number]: SpaceSettings } = {};
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

	readonly spaceCreationFee = new BigNumber(100000 * 10 ** 18);

	private async _cacheSpaceSettings(spaceId: number, spaceSettings: SpaceSettings): Promise<void> {
		this._cachedSpacesSettings[spaceId] = spaceSettings;
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
			snapshot,
			choices,
			choicesExecutors,
			choicesData,
			votes,
		] = result;
		await this.getSpace(spaceId);

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
			snapshot: Number.parseInt(snapshot as string),
		});

		await this._cacheProposals(spaceId, [proposal]);
		return proposal;
	}

	async loadSpaceDescription(spaceId: number): Promise<void> {}

	async loadSpaceMembers(spaceId: number): Promise<void> {}

	async loadSpaceAdmins(spaceId: number): Promise<void> {
		try {
			let addresses = [];
			const result = (await this.queryContract(VitasensusContract, 'getSpaceAdmins', [
				spaceId,
			])) as Array<string>[];

			for (let i = 0; i < result[0].length; i++) {
				const address = result[0][i];
				addresses.push(address);
			}
			this._cachedSpaces[spaceId].admins = addresses;
		} catch (e) {
			console.error(e);
		}
	}

	async loadTokenDetails(tokenId: string): Promise<void> {
		const tokenInfo = await getTokenInfo(this.viteApi, tokenId);

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

	async getSpace(id: number, recache: boolean = false): Promise<DetailedSpace | null> {
		if (!recache && this._cachedSpaces[id] && this._cachedSpaces[id].description)
			return this._cachedSpaces[id];
		const result = (await this.queryContract(VitasensusContract, 'getSpaceExternal', [
			id,
		])) as object[] as unknown[] as string[];

		const [name, description, token, avatar, website, memberCount, decimals] = result;
		await this.loadTokenDetails(token);
		const result2 = (await this.queryContract(VitasensusContract, 'getSpaceOwner', [
			id,
		])) as object[] as unknown[] as string[];

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
			owner: result2[0],
		};
		await this._cacheSpaces([space]);

		return space;
	}

	async getSpaceSettings(id: number, recache: boolean = false): Promise<SpaceSettings> {
		if (!recache && this._cachedSpacesSettings[id]) return this._cachedSpacesSettings[id];

		const result = (await this.queryContract(VitasensusContract, 'getSpaceSettings', [
			id,
		])) as unknown as string[];

		const createProposalThreshold = parseInt(result[0]);
		const onlyAdminsCanCreateProposal = result[1] === '1';

		const spaceSettings: SpaceSettings = {
			createProposalThreshold,
			onlyAdminsCanCreateProposal,
		};
		await this._cacheSpaceSettings(id, spaceSettings);

		return spaceSettings;
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

				const [voters, votess, choices] = result;
				for (let i = 0; i < result[0].length; i++) {
					const votes_ = Number.parseInt(votess[i] as string);
					const vote: Vote = {
						proposal: proposal,
						amount: votes_,
						choice: Number.parseInt((choices?.[i] ?? '0') as string),
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

	async getVotingPower(spaceId: number, height: number): Promise<number> {
		console.log(this.vitasensusServerURL);

		if (!this.vitasensusServerURL) return 0;
		console.log('Passed server url');

		const { token } = (await this.getSpace(spaceId)) ?? {};
		if (!token) return 0;
		const response = await axios.get(`balance/${height.toFixed(0)}/${token?.id}/${this.address}`, {
			baseURL: this.vitasensusServerURL,
		});

		return new BigNumber(response.data.balance ?? '0', 10)
			.idiv(Math.pow(10, token.decimals), 10)
			.toNumber();
	}

	async hasUserVoted(spaceId: number, proposalId: number, user: string): Promise<boolean> {
		console.log(spaceId, proposalId, user);

		const result = (await this.queryContract(VitasensusContract, 'hasVoted', [
			spaceId,
			proposalId,
			user,
		])) as object[] as unknown[] as string[];

		console.log(result);

		return result[0] !== '0';
	}

	async createSpace(
		name: string,
		description: string,
		spaceToken: string,
		avatar: string,
		website: string
	): Promise<any> {
		await this.loadTokenDetails(spaceToken);
		// console.log(this.spaceCreationFee.toFixed(0));

		const result = (await this.callContract(
			VitasensusContract,
			'createSpace',
			[
				encodeStringToBytes32(name),
				description,
				spaceToken,
				encodeStringToBytes32(avatar),
				encodeStringToBytes32(website),
				this.getToken(spaceToken).decimals,
			],
			ViteTokenId,
			this.spaceCreationFee.toFixed(0)
		)) as any;

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

	async updateSpace(
		spaceId: number,
		name: string,
		description: string,
		spaceToken: string,
		avatar: string,
		website: string
	): Promise<any> {
		await this.loadTokenDetails(spaceToken);
		await this.callContract(VitasensusContract, 'updateSpace', [
			spaceId,
			encodeStringToBytes32(name),
			description,
			spaceToken,
			this.getToken(spaceToken).decimals,
			encodeStringToBytes32(avatar),
			encodeStringToBytes32(website),
		]);

		const space = await this.getSpace(spaceId, true);
		return space;
	}

	async updateSpaceProposalThreshold(
		spaceId: number,
		proposalThreshold: number,
		onlyAdminsCanCreateProposal: boolean
	): Promise<any> {
		await this.callContract(VitasensusContract, 'updateSpaceCreateProposalThreshold', [
			spaceId,
			proposalThreshold,
			onlyAdminsCanCreateProposal,
		]);
	}

	async updateSpaceAdmins(spaceId: number, admins: string[]) {
		await this.callContract(VitasensusContract, 'setSpaceAdmins', [spaceId, admins]);
	}

	async isSpaceAdmin(spaceId: number): Promise<boolean> {
		if (!this.address) return false;
		const result = (await this.queryContract(VitasensusContract, 'isSpaceAdmin', [
			spaceId,
			this.address,
		])) as any as string[];

		return result[0] === '1';
	}

	async canRedeemSpaceCreationFee(spaceId: number): Promise<boolean> {
		const result = (await this.queryContract(VitasensusContract, 'getCreationTimestamp', [
			spaceId,
		])) as any as string[];

		const timestamp = parseInt(result[0]);

		return timestamp + 7776000 < Date.now() / 1000;
	}

	async redeemSpaceCreationFee(spaceId: number): Promise<any> {
		await this.callContract(VitasensusContract, 'redeemSpaceCreationFee', [spaceId]);
	}

	async createProposal({
		actions,
		choices,
		description,
		end,
		spaceId,
		start,
		title,
	}: {
		spaceId: number;
		title: string;
		description: string;
		choices: string[];
		actions: ChoiceAction[];
		end: number;
		start: number;
		link?: string;
	}): Promise<Proposal> {
		const space = await this.getSpace(spaceId);
		const spaceSettings = await this.getSpaceSettings(spaceId);
		const isAdmin = await this.isSpaceAdmin(spaceId);
		const snapshot = await this.serverViteApi.request('ledger_getSnapshotChainHeight');
		const result = (await this.callContract(
			VitasensusContract,
			'createProposal',
			[
				spaceId,
				title,
				description,
				start,
				end,
				snapshot,
				choices.map((choice) => encodeStringToBytes32(choice)),
				actions.map((action) => action.executor),
				actions.map((action) => action.data.padEnd(64, '0')),
			],
			space?.token.id,
			isAdmin
				? '0'
				: new BigNumber(spaceSettings.createProposalThreshold)
						.multipliedBy(Math.pow(10, this._cachedSpaces[spaceId].token.decimals))
						.toFixed(0)
		)) as any;

		const events: any[] = (await this.scanEvents(
			VitasensusContract,
			result.height,
			'ProposalCreated'
		)) as any[];

		const event = events[events.length - 1] as any;
		const proposalId = event.returnValues.id;
		const proposal = await this.getProposal(spaceId, Number.parseInt(proposalId));

		return proposal!;
	}

	async vote(spaceId: number, proposal: number, choiceIndex: number): Promise<void> {
		if (!this.signMessage) throw Error('Cannot sign message');
		const message = `Sign this message to confirm your vote

Space ID: ${spaceId}
Proposal ID: ${proposal}
Choice index: ${choiceIndex}`;

		const { signature, publicKey } = await this.signMessage(message);

		await axios.put(
			`vote/${spaceId}/${proposal}`,
			{ signature, publicKey, choiceIndex },
			{ baseURL: this.vitasensusServerURL }
		);
	}

	async joinSpace(spaceId: number): Promise<void> {
		await this.callContract(VitasensusContract, 'joinSpace', [spaceId]);
	}

	async executeProposal(spaceId: number, proposalId: number): Promise<void> {
		await this.callContract(VitasensusContract, 'executeProposal', [spaceId, proposalId]);
	}

	async isProposalExecuted(spaceId: number, proposalId: number): Promise<boolean> {
		const result = (await this.queryContract(VitasensusContract, 'isProposalExecuted', [
			spaceId,
			proposalId,
		])) as any;

		return result[0] === '1';
	}
}
