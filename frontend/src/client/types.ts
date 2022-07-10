export interface Proposal {
	id: number;
	author: string;
	spaceId: number;
	space?: Space;
	title: string;
	description: string;
	link: string;
	choices: string[];
	start: number;
	end: number;
	passActions: { address: string; calldata: string }[];
	state: ProposalState;
}

export enum ProposalState {
	active = 'active',
	closed = 'closed',
}

export interface Vote {
	id: number;
	author: string;
	space: string;
	proposal: number;
	choices: number[];
	amount: number;
}

export interface Token {
	id: string;
	name: string;
	symbol: string;
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
}
