const Vitasensus = {
	address: {
		mainnet: process.env.REACT_APP_VITASENSUS_MAINNET_CONTRACT_ADDRESS,
		testnet:
			process.env.REACT_APP_VITASENSUS_TESTNET_CONTRACT_ADDRESS ||
			'vite_f1926c54b81069e4ecb2face559739714cdbc3b00423056c86', // <your_contract_address>
		localnet:
			process.env.REACT_APP_VITASENSUS_LOCALNET_CONTRACT_ADDRESS ||
			'vite_22ad191e13ccb892c812244e537bb409785e5831bd88729204',
	},
	abi: [
		{
			anonymous: false,
			inputs: [
				{ indexed: true, internalType: 'uint256', name: 'spaceId', type: 'uint256' },
				{ indexed: true, internalType: 'address', name: 'user', type: 'address' },
			],
			name: 'JoinedSpace',
			type: 'event',
		},
		{
			anonymous: false,
			inputs: [
				{ indexed: true, internalType: 'uint256', name: 'spaceId', type: 'uint256' },
				{ indexed: true, internalType: 'address', name: 'user', type: 'address' },
			],
			name: 'LeftSpace',
			type: 'event',
		},
		{
			anonymous: false,
			inputs: [
				{ indexed: true, internalType: 'uint256', name: 'id', type: 'uint256' },
				{ indexed: true, internalType: 'uint256', name: 'spaceId', type: 'uint256' },
				{ indexed: true, internalType: 'address', name: 'author', type: 'address' },
				{ indexed: false, internalType: 'string', name: 'title', type: 'string' },
				{ indexed: false, internalType: 'string', name: 'description', type: 'string' },
				{ indexed: false, internalType: 'uint256', name: 'startTime', type: 'uint256' },
				{ indexed: false, internalType: 'uint256', name: 'endTime', type: 'uint256' },
			],
			name: 'ProposalCreated',
			type: 'event',
		},
		{
			anonymous: false,
			inputs: [
				{ indexed: true, internalType: 'uint256', name: 'proposalId', type: 'uint256' },
				{ indexed: true, internalType: 'uint256', name: 'spaceId', type: 'uint256' },
				{ indexed: false, internalType: 'uint256', name: 'choiceId', type: 'uint256' },
			],
			name: 'ProposalExecuted',
			type: 'event',
		},
		{
			anonymous: false,
			inputs: [
				{ indexed: true, internalType: 'uint256', name: 'id', type: 'uint256' },
				{ indexed: true, internalType: 'tokenId', name: 'token', type: 'tokenId' },
				{ indexed: true, internalType: 'bytes32', name: 'name', type: 'bytes32' },
				{ indexed: false, internalType: 'bytes32', name: 'avatar', type: 'bytes32' },
				{ indexed: false, internalType: 'string', name: 'description', type: 'string' },
			],
			name: 'SpaceCreated',
			type: 'event',
		},
		{
			anonymous: false,
			inputs: [
				{ indexed: true, internalType: 'uint256', name: 'id', type: 'uint256' },
				{ indexed: false, internalType: 'bytes32', name: 'name', type: 'bytes32' },
				{ indexed: false, internalType: 'string', name: 'description', type: 'string' },
				{ indexed: false, internalType: 'tokenId', name: 'token', type: 'tokenId' },
				{ indexed: false, internalType: 'bytes32', name: 'avatar', type: 'bytes32' },
				{ indexed: false, internalType: 'bytes32', name: 'website', type: 'bytes32' },
			],
			name: 'SpaceUpdated',
			type: 'event',
		},
		{
			inputs: [],
			name: 'SPACE_CREATION_FEE',
			outputs: [{ internalType: 'uint256', name: '', type: 'uint256' }],
			stateMutability: 'view',
			type: 'function',
		},
		{
			inputs: [{ internalType: 'uint256', name: 'spaceId', type: 'uint256' }],
			name: 'canRedeemSpaceCreationFee',
			outputs: [{ internalType: 'bool', name: '', type: 'bool' }],
			stateMutability: 'view',
			type: 'function',
		},
		{
			inputs: [
				{ internalType: 'uint256', name: 'spaceId', type: 'uint256' },
				{ internalType: 'string', name: 'title', type: 'string' },
				{ internalType: 'string', name: 'description', type: 'string' },
				{ internalType: 'uint256', name: 'startTime', type: 'uint256' },
				{ internalType: 'uint256', name: 'endTime', type: 'uint256' },
				{ internalType: 'bytes32[]', name: 'choices', type: 'bytes32[]' },
				{ internalType: 'address[]', name: 'choicesExecutors', type: 'address[]' },
				{ internalType: 'bytes32[]', name: 'choicesData', type: 'bytes32[]' },
			],
			name: 'createProposal',
			outputs: [],
			stateMutability: 'payable',
			type: 'function',
		},
		{
			inputs: [
				{ internalType: 'bytes32', name: 'name', type: 'bytes32' },
				{ internalType: 'string', name: 'description', type: 'string' },
				{ internalType: 'tokenId', name: 'spaceToken', type: 'tokenId' },
				{ internalType: 'bytes32', name: 'avatar', type: 'bytes32' },
				{ internalType: 'bytes32', name: 'website', type: 'bytes32' },
				{ internalType: 'uint256', name: 'spaceTokenDecimals', type: 'uint256' },
			],
			name: 'createSpace',
			outputs: [],
			stateMutability: 'payable',
			type: 'function',
		},
		{
			inputs: [
				{ internalType: 'uint256', name: 'spaceId', type: 'uint256' },
				{ internalType: 'uint256', name: 'proposalId', type: 'uint256' },
			],
			name: 'executeProposal',
			outputs: [],
			stateMutability: 'nonpayable',
			type: 'function',
		},
		{
			inputs: [{ internalType: 'uint256', name: 'spaceId', type: 'uint256' }],
			name: 'getSpaceAdmins',
			outputs: [{ internalType: 'address[]', name: '', type: 'address[]' }],
			stateMutability: 'view',
			type: 'function',
		},
		{
			inputs: [{ internalType: 'uint256', name: 'spaceId', type: 'uint256' }],
			name: 'getSpaceExternal',
			outputs: [
				{ internalType: 'bytes32', name: 'name', type: 'bytes32' },
				{ internalType: 'string', name: 'description', type: 'string' },
				{ internalType: 'tokenId', name: 'token', type: 'tokenId' },
				{ internalType: 'bytes32', name: 'avatar', type: 'bytes32' },
				{ internalType: 'bytes32', name: 'website', type: 'bytes32' },
				{ internalType: 'uint256', name: 'memberCounts', type: 'uint256' },
				{ internalType: 'uint256', name: 'tokenDecimals', type: 'uint256' },
			],
			stateMutability: 'view',
			type: 'function',
		},
		{
			inputs: [{ internalType: 'uint256', name: 'spaceId', type: 'uint256' }],
			name: 'getSpaceOwner',
			outputs: [{ internalType: 'address', name: '', type: 'address' }],
			stateMutability: 'view',
			type: 'function',
		},
		{
			inputs: [
				{ internalType: 'uint256', name: 'spaceId', type: 'uint256' },
				{ internalType: 'uint256', name: 'proposalId', type: 'uint256' },
			],
			name: 'getSpaceProposal',
			outputs: [
				{ internalType: 'string', name: 'title', type: 'string' },
				{ internalType: 'string', name: 'description', type: 'string' },
				{ internalType: 'address', name: 'author', type: 'address' },
				{ internalType: 'uint256', name: 'startTime', type: 'uint256' },
				{ internalType: 'uint256', name: 'endTime', type: 'uint256' },
				{ internalType: 'bytes32[]', name: 'choices', type: 'bytes32[]' },
				{ internalType: 'address[]', name: 'choicesExecutors', type: 'address[]' },
				{ internalType: 'bytes32[]', name: 'choicesData', type: 'bytes32[]' },
				{ internalType: 'uint256[]', name: 'votes', type: 'uint256[]' },
			],
			stateMutability: 'view',
			type: 'function',
		},
		{
			inputs: [
				{ internalType: 'uint256', name: 'spaceId', type: 'uint256' },
				{ internalType: 'uint256', name: 'proposalId', type: 'uint256' },
				{ internalType: 'uint256', name: 'skip', type: 'uint256' },
				{ internalType: 'uint256', name: 'limit', type: 'uint256' },
			],
			name: 'getSpaceProposalVotes',
			outputs: [
				{ internalType: 'address[]', name: 'voters', type: 'address[]' },
				{ internalType: 'uint256[][]', name: 'votes', type: 'uint256[][]' },
			],
			stateMutability: 'view',
			type: 'function',
		},
		{
			inputs: [
				{ internalType: 'uint256', name: 'spaceId', type: 'uint256' },
				{ internalType: 'uint256', name: 'proposalId', type: 'uint256' },
			],
			name: 'getSpaceProposalVotesCount',
			outputs: [{ internalType: 'uint256', name: '', type: 'uint256' }],
			stateMutability: 'view',
			type: 'function',
		},
		{
			inputs: [
				{ internalType: 'uint256', name: 'spaceId', type: 'uint256' },
				{ internalType: 'uint256', name: 'skip', type: 'uint256' },
				{ internalType: 'uint256', name: 'limit', type: 'uint256' },
			],
			name: 'getSpaceProposals',
			outputs: [
				{ internalType: 'uint256[]', name: 'proposalIds', type: 'uint256[]' },
				{ internalType: 'string[]', name: 'titles', type: 'string[]' },
				{ internalType: 'string[]', name: 'descriptions', type: 'string[]' },
				{ internalType: 'uint256[]', name: 'startTimes', type: 'uint256[]' },
				{ internalType: 'uint256[]', name: 'endTimes', type: 'uint256[]' },
				{ internalType: 'uint256[]', name: 'choicesCount', type: 'uint256[]' },
			],
			stateMutability: 'view',
			type: 'function',
		},
		{
			inputs: [{ internalType: 'uint256', name: 'spaceId', type: 'uint256' }],
			name: 'getSpaceProposalsCount',
			outputs: [{ internalType: 'uint256', name: '', type: 'uint256' }],
			stateMutability: 'view',
			type: 'function',
		},
		{
			inputs: [{ internalType: 'uint256', name: 'spaceId', type: 'uint256' }],
			name: 'getSpaceSettings',
			outputs: [
				{ internalType: 'uint256', name: 'proposalThreshold', type: 'uint256' },
				{ internalType: 'bool', name: 'onlyAdminCreateProposal', type: 'bool' },
			],
			stateMutability: 'view',
			type: 'function',
		},
		{
			inputs: [
				{ internalType: 'uint256', name: 'skip', type: 'uint256' },
				{ internalType: 'uint256', name: 'limit', type: 'uint256' },
			],
			name: 'getSpaces',
			outputs: [
				{ internalType: 'bytes32[]', name: 'names', type: 'bytes32[]' },
				{ internalType: 'tokenId[]', name: 'tokens', type: 'tokenId[]' },
				{ internalType: 'bytes32[]', name: 'avatars', type: 'bytes32[]' },
				{ internalType: 'bytes32[]', name: 'websites', type: 'bytes32[]' },
				{ internalType: 'uint256[]', name: 'memberCounts', type: 'uint256[]' },
			],
			stateMutability: 'view',
			type: 'function',
		},
		{
			inputs: [],
			name: 'getSpacesCount',
			outputs: [{ internalType: 'uint256', name: '', type: 'uint256' }],
			stateMutability: 'view',
			type: 'function',
		},
		{
			inputs: [{ internalType: 'address', name: 'user', type: 'address' }],
			name: 'getUserSpaces',
			outputs: [
				{ internalType: 'uint256[]', name: 'spaceIds', type: 'uint256[]' },
				{ internalType: 'bytes32[]', name: 'names', type: 'bytes32[]' },
				{ internalType: 'bytes32[]', name: 'avatars', type: 'bytes32[]' },
			],
			stateMutability: 'view',
			type: 'function',
		},
		{
			inputs: [
				{ internalType: 'uint256', name: 'spaceId', type: 'uint256' },
				{ internalType: 'uint256', name: 'proposalId', type: 'uint256' },
			],
			name: 'getWinningChoiceIndex',
			outputs: [{ internalType: 'uint256', name: '', type: 'uint256' }],
			stateMutability: 'view',
			type: 'function',
		},
		{
			inputs: [
				{ internalType: 'uint256', name: 'spaceId', type: 'uint256' },
				{ internalType: 'uint256', name: 'proposalId', type: 'uint256' },
			],
			name: 'isProposalActive',
			outputs: [{ internalType: 'bool', name: '', type: 'bool' }],
			stateMutability: 'view',
			type: 'function',
		},
		{
			inputs: [
				{ internalType: 'uint256', name: 'spaceId', type: 'uint256' },
				{ internalType: 'uint256', name: 'proposalId', type: 'uint256' },
			],
			name: 'isProposalClosed',
			outputs: [{ internalType: 'bool', name: '', type: 'bool' }],
			stateMutability: 'view',
			type: 'function',
		},
		{
			inputs: [
				{ internalType: 'uint256', name: 'spaceId', type: 'uint256' },
				{ internalType: 'uint256', name: 'proposalId', type: 'uint256' },
			],
			name: 'isProposalExecuted',
			outputs: [{ internalType: 'bool', name: '', type: 'bool' }],
			stateMutability: 'view',
			type: 'function',
		},
		{
			inputs: [
				{ internalType: 'uint256', name: 'spaceId', type: 'uint256' },
				{ internalType: 'address', name: 'user', type: 'address' },
			],
			name: 'isSpaceAdmin',
			outputs: [{ internalType: 'bool', name: '', type: 'bool' }],
			stateMutability: 'view',
			type: 'function',
		},
		{
			inputs: [
				{ internalType: 'uint256', name: 'spaceId', type: 'uint256' },
				{ internalType: 'address', name: 'user', type: 'address' },
			],
			name: 'isSpaceMember',
			outputs: [{ internalType: 'bool', name: '', type: 'bool' }],
			stateMutability: 'view',
			type: 'function',
		},
		{
			inputs: [
				{ internalType: 'uint256', name: 'spaceId', type: 'uint256' },
				{ internalType: 'address', name: 'user', type: 'address' },
			],
			name: 'isSpaceOwner',
			outputs: [{ internalType: 'bool', name: '', type: 'bool' }],
			stateMutability: 'view',
			type: 'function',
		},
		{
			inputs: [{ internalType: 'uint256', name: 'spaceId', type: 'uint256' }],
			name: 'joinSpace',
			outputs: [],
			stateMutability: 'nonpayable',
			type: 'function',
		},
		{
			inputs: [{ internalType: 'uint256', name: 'spaceId', type: 'uint256' }],
			name: 'leaveSpace',
			outputs: [],
			stateMutability: 'nonpayable',
			type: 'function',
		},
		{
			inputs: [{ internalType: 'uint256', name: 'spaceId', type: 'uint256' }],
			name: 'redeemSpaceCreationFee',
			outputs: [],
			stateMutability: 'nonpayable',
			type: 'function',
		},
		{
			inputs: [
				{ internalType: 'uint256', name: 'spaceId', type: 'uint256' },
				{ internalType: 'uint256', name: 'proposalId', type: 'uint256' },
				{ internalType: 'address', name: 'voter', type: 'address' },
			],
			name: 'redeemVotedTokens',
			outputs: [],
			stateMutability: 'nonpayable',
			type: 'function',
		},
		{
			inputs: [
				{ internalType: 'uint256', name: 'spaceId', type: 'uint256' },
				{ internalType: 'address[]', name: 'newAdmins', type: 'address[]' },
			],
			name: 'setSpaceAdmins',
			outputs: [],
			stateMutability: 'nonpayable',
			type: 'function',
		},
		{
			inputs: [
				{ internalType: 'uint256', name: 'spaceId', type: 'uint256' },
				{ internalType: 'bytes32', name: 'name', type: 'bytes32' },
				{ internalType: 'string', name: 'description', type: 'string' },
				{ internalType: 'tokenId', name: 'spaceToken', type: 'tokenId' },
				{ internalType: 'uint256', name: 'spaceTokenDecimals', type: 'uint256' },
				{ internalType: 'bytes32', name: 'avatar', type: 'bytes32' },
				{ internalType: 'bytes32', name: 'website', type: 'bytes32' },
			],
			name: 'updateSpace',
			outputs: [],
			stateMutability: 'nonpayable',
			type: 'function',
		},
		{
			inputs: [
				{ internalType: 'uint256', name: 'spaceId', type: 'uint256' },
				{ internalType: 'uint256', name: 'threshold', type: 'uint256' },
				{ internalType: 'bool', name: 'adminCreateProposal', type: 'bool' },
			],
			name: 'updateSpaceCreateProposalThreshold',
			outputs: [],
			stateMutability: 'nonpayable',
			type: 'function',
		},
		{
			inputs: [
				{ internalType: 'uint256', name: 'spaceId', type: 'uint256' },
				{ internalType: 'uint256', name: 'proposalId', type: 'uint256' },
				{ internalType: 'uint256[]', name: 'votes', type: 'uint256[]' },
			],
			name: 'voteOnProposal',
			outputs: [],
			stateMutability: 'payable',
			type: 'function',
		},
	],
};

export default Vitasensus;
