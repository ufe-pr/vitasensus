export class ChoiceAction {
	constructor(readonly executor: string, readonly data: string) {}
}

export enum ProposalState {
	active = 'active',
	closed = 'closed',
	pending = 'pending',
}

export class Proposal {
	id: number;
	author: string;
	spaceId: number;
	space?: Space;
	snapshot: number;
	title: string;
	description: string;
	choices: string[];
	choicesVotesCounts: number[];
	start: number;
	end: number;
	passActions: ChoiceAction[];

	get state(): ProposalState {
		if (this.end * 1000 < Date.now()) {
			return ProposalState.closed;
		}
		if (this.start * 1000 > Date.now()) {
			return ProposalState.pending;
		}
		return ProposalState.active;
	}

	constructor({
		id,
		author,
		spaceId,
		title,
		description,
		choices,
		choicesVotesCounts,
		start,
		end,
		passActions,
		snapshot,
	}: Proposal) {
		this.id = id;
		this.author = author;
		this.spaceId = spaceId;
		this.title = title;
		this.description = description;
		this.choices = choices;
		this.choicesVotesCounts = choicesVotesCounts;
		this.start = start;
		this.end = end;
		this.passActions = passActions;
		this.snapshot = snapshot;
	}
}

export interface Vote {
	id: number;
	author: string;
	space: number;
	proposal: number;
	choice: number;
	amount: number;
}

export interface Token {
	id: string;
	name: string;
	symbol: string;
	decimals: number;
}

export interface Space {
	id: number;
	name: string;
	isPrivate: boolean;
	memberCount: number;
	avatar?: string;
	token: Token;
}

export interface DetailedSpace extends Space {
	members: string[];
	admins: string[];
	description?: string;
	website?: string;
	owner?: string;
}

export interface SpaceSettings {
	createProposalThreshold: number;
	onlyAdminsCanCreateProposal: boolean;
}