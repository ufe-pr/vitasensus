import { describe } from 'mocha';
import chai, { expect } from 'chai';
import * as vuilder from '@vite/vuilder';
import config from './vite.config.json';
import { BigNumber } from 'bignumber.js';
import cap from 'chai-as-promised';
import bnChai from 'chai-bn';

chai.use(bnChai(BigNumber));
chai.use(cap);

let provider: any;
let deployer: vuilder.UserAccount;
let user1: vuilder.UserAccount, user2: vuilder.UserAccount;

type CompiledContracts = {
	[key: string]: vuilder.Contract;
};

describe('test Vitasensus', () => {
	let sensus: vuilder.Contract;
	before(async function () {
		provider = vuilder.newProvider(config.networks.local.http);
		console.log(await provider.request('ledger_getSnapshotChainHeight'));
		deployer = vuilder.newAccount(config.networks.local.mnemonic, 0, provider);
		user1 = vuilder.newAccount(config.networks.local.mnemonic, 1, provider);
		console.log('deployer', deployer.address);
	});

	beforeEach(async () => {
		const compiledContracts: CompiledContracts = await vuilder.compile('Vitasensus.solpp');
		expect(compiledContracts).to.have.property('Vitasensus');
		sensus = compiledContracts.Vitasensus;
		sensus.setDeployer(deployer);
		sensus.setProvider(provider);
		await sensus.deploy({ responseLatency: 1 });
	});

	async function createSpace(...[num]: number[]) {
		const space = {
			// 'Vitasensus'
			name: '0x5669746173656e737573000000000000000000000000000000000000000000',
			description: 'description' + (num ?? ''),
			tokenId: 'tti_5649544520544f4b454e6e40',
			avatar: '0x00000000000000000000000000000000000000000000000000000000000000',
			website: '0x00000000000000000000000000000000000000000000000000000000000000',
			decimals: 18,
		};
		await sensus.call(
			'createSpace',
			[space.name, space.description, space.tokenId, space.avatar, space.website, space.decimals],
			{ caller: deployer }
		);
	}

	it('should create a space', async () => {
		await createSpace();
		const spaceCountResult: any = await sensus.query('getSpacesCount', []);
		expect(spaceCountResult).to.be.an('array');
		expect(spaceCountResult).to.have.lengthOf(1);
		expect(spaceCountResult[0]).to.equal('1');

		const spaceExternalResult: any = await sensus.query('getSpaceExternal', [0]);
		expect(spaceExternalResult).to.be.an('array');
		expect(spaceExternalResult).to.have.lengthOf(7);
		expect(spaceExternalResult).to.deep.equal([
			'5669746173656e73757300000000000000000000000000000000000000000000',
			'description',
			'tti_5649544520544f4b454e6e40',
			'0000000000000000000000000000000000000000000000000000000000000000',
			'0000000000000000000000000000000000000000000000000000000000000000',
			'1', // The space owner should also be a member
			'18',
		]);
	});

	it('should create multiple spaces', async () => {
		await createSpace();
		await createSpace(1);
		const spaceCountResult: any = await sensus.query('getSpacesCount', []);
		expect(spaceCountResult).to.be.an('array');
		expect(spaceCountResult).to.have.lengthOf(1);
		expect(spaceCountResult[0]).to.equal('2');

		const spaceExternalResult: any = await sensus.query('getSpaceExternal', [1]);
		expect(spaceExternalResult).to.be.an('array');
		expect(spaceExternalResult).to.have.lengthOf(7);
		expect(spaceExternalResult).to.deep.equal([
			'5669746173656e73757300000000000000000000000000000000000000000000',
			'description1',
			'tti_5649544520544f4b454e6e40',
			'0000000000000000000000000000000000000000000000000000000000000000',
			'0000000000000000000000000000000000000000000000000000000000000000',
			'1', // The space owner should also be a member
			'18',
		]);
	});

	it('should join space', async () => {
		await createSpace();
		await deployer.sendToken(user1.address, '100000000');
		await user1.receiveAll();

		await sensus.call('joinSpace', [0], { caller: user1 });
		const spaceMemberCountResult: any = await sensus.query('getSpaceMembersCount', [0]);
		expect(spaceMemberCountResult).to.be.an('array');
		expect(spaceMemberCountResult).to.have.lengthOf(1);
		expect(spaceMemberCountResult[0]).to.equal('2');

		const isMemberResult: any = await sensus.query('isSpaceMember', [0, user1.address]);
		expect(isMemberResult).to.be.an('array');
		expect(isMemberResult).to.have.lengthOf(1);
		expect(isMemberResult[0]).to.equal('1');
	});

	it('should leave space', async () => {
		await createSpace();
		await deployer.sendToken(user1.address, '100000000');
		await user1.receiveAll();

		await sensus.call('joinSpace', [0], { caller: user1 });
		const spaceMemberCountResult1: any = await sensus.query('getSpaceMembersCount', [0]);
		expect(spaceMemberCountResult1).to.be.an('array');
		expect(spaceMemberCountResult1).to.have.lengthOf(1);
		expect(spaceMemberCountResult1[0]).to.equal('2');

		const isMemberResult1: any = await sensus.query('isSpaceMember', [0, user1.address]);
		expect(isMemberResult1).to.be.an('array');
		expect(isMemberResult1).to.have.lengthOf(1);
		expect(isMemberResult1[0]).to.equal('1');

		await sensus.call('leaveSpace', [0], { caller: user1 });
		const spaceMemberCountResult: any = await sensus.query('getSpaceMembersCount', [0]);
		expect(spaceMemberCountResult).to.be.an('array');
		expect(spaceMemberCountResult).to.have.lengthOf(1);
		expect(spaceMemberCountResult[0]).to.equal('1');

		const isMemberResult: any = await sensus.query('isSpaceMember', [0, user1.address]);
		expect(isMemberResult).to.be.an('array');
		expect(isMemberResult).to.have.lengthOf(1);
		expect(isMemberResult[0]).to.equal('0');
	});

	it('should create proposal', async () => {
		await createSpace();

		const proposal = {
			title: 'title',
			description: 'description',
			startTime: 0,
			endTime: Math.floor(Date.now() / 1000) + 86400,
			choices: ['5669746173656e73757300000000000000000000000000000000000000000000'],
			choiceExecutors: ['vite_0000000000000000000000000000000000000000a4f3a0cb58'],
			choiceDatas: ['5669746173656e73757300000000000000000000000000000000000000000000'],
		};

		await sensus.call(
			'createProposal',
			[
				0,
				proposal.title,
				proposal.description,
				proposal.startTime,
				proposal.endTime,
				proposal.choices,
				proposal.choiceExecutors,
				proposal.choiceDatas,
			],
			{ caller: deployer }
		);
		const spaceProposalsCountResult: any = await sensus.query('getSpaceProposalsCount', [0]);
		expect(spaceProposalsCountResult).to.be.an('array');
		expect(spaceProposalsCountResult).to.have.lengthOf(1);
		expect(spaceProposalsCountResult[0]).to.equal('1');
	});

	it('should vote for proposal', async () => {
		await createSpace();
		await deployer.sendToken(user1.address, '11000000000000000000');
		await user1.receiveAll();

		await sensus.call('joinSpace', [0], { caller: user1 });

		const proposal = {
			title: 'title',
			description: 'description',
			startTime: 0,
			endTime: Math.floor(Date.now() / 1000) + 86400,
			choices: [
				'5669746173656e73757300000000000000000000000000000000000000000000',
				'5669746173656e73757374000000000000000000000000000000000000000000',
			],
			choiceExecutors: [
				'vite_0000000000000000000000000000000000000000a4f3a0cb58',
				'vite_0000000000000000000000000000000000000000a4f3a0cb58',
			],
			choiceDatas: [
				'5669746173656e73757300000000000000000000000000000000000000000000',
				'5669746173656e73757374000000000000000000000000000000000000000000',
			],
		};

		await sensus.call(
			'createProposal',
			[
				0,
				proposal.title,
				proposal.description,
				proposal.startTime,
				proposal.endTime,
				proposal.choices,
				proposal.choiceExecutors,
				proposal.choiceDatas,
			],
			{ caller: deployer }
		);

		await sensus.call('voteOnProposal', [0, 0, [10, 0]], {
			caller: user1,
			amount: '10000000000000000000',
		});
		const proposalVotesCountResult: any = await sensus.query('getSpaceProposalVotesCount', [0, 0]);
		expect(proposalVotesCountResult).to.be.an('array');
		expect(proposalVotesCountResult).to.have.lengthOf(1);
		expect(proposalVotesCountResult[0]).to.equal('1');

		const proposalWinningChoiceIndex: any = await sensus.query('getWinningChoiceIndex', [0, 0]);
		expect(proposalWinningChoiceIndex).to.be.an('array');
		expect(proposalWinningChoiceIndex).to.have.lengthOf(1);
		expect(proposalWinningChoiceIndex[0]).to.equal('0');
	});

	it('should prevent vote for proposal if expired', async () => {
		await createSpace();
		await deployer.sendToken(user1.address, '21000000000000000000');
		await user1.receiveAll();

		await sensus.call('joinSpace', [0], { caller: user1 });

		const proposal = {
			title: 'title',
			description: 'description',
			startTime: 0,
			endTime: Math.floor(Date.now() / 1000) + 20,
			choices: [
				'5669746173656e73757300000000000000000000000000000000000000000000',
				'5669746173656e73757374000000000000000000000000000000000000000000',
			],
			choiceExecutors: [
				'vite_0000000000000000000000000000000000000000a4f3a0cb58',
				'vite_0000000000000000000000000000000000000000a4f3a0cb58',
			],
			choiceDatas: [
				'5669746173656e73757300000000000000000000000000000000000000000000',
				'5669746173656e73757374000000000000000000000000000000000000000000',
			],
		};

		await sensus.call(
			'createProposal',
			[
				0,
				proposal.title,
				proposal.description,
				proposal.startTime,
				proposal.endTime,
				proposal.choices,
				proposal.choiceExecutors,
				proposal.choiceDatas,
			],
			{ caller: deployer }
		);

		await sensus.call('voteOnProposal', [0, 0, [10, 0]], {
			caller: user1,
			amount: '10000000000000000000',
		});

		await vuilder.utils.sleep(20000);
		await expect(
			sensus.call('voteOnProposal', [0, 0, [0, 11]], {
				caller: user1,
				amount: '10000000000000000000',
			})
		).to.eventually.be.rejectedWith(/revert/);

		// Only the first vote should have been counted
		const proposalVotesCountResult: any = await sensus.query('getSpaceProposalVotesCount', [0, 0]);
		expect(proposalVotesCountResult).to.be.an('array');
		expect(proposalVotesCountResult).to.have.lengthOf(1);
		expect(proposalVotesCountResult[0]).to.equal('1');

		const proposalWinningChoiceIndex: any = await sensus.query('getWinningChoiceIndex', [0, 0]);
		expect(proposalWinningChoiceIndex).to.be.an('array');
		expect(proposalWinningChoiceIndex).to.have.lengthOf(1);
		expect(proposalWinningChoiceIndex[0]).to.equal('0');
	});

	it('should execute proposal with on-chain governance (if executor is provided)', async () => {
		await createSpace();

		const compiledContracts: CompiledContracts = await vuilder.compile(
			'VitasensusProposalExecutor.solpp'
		);
		expect(compiledContracts).to.have.property('ExternalCallTestContract');
		const executor = compiledContracts.ExternalCallTestContract;
		executor.setDeployer(deployer);
		executor.setProvider(provider);
		await executor.deploy({ responseLatency: 1 });

		await deployer.sendToken(user1.address, '21000000000000000000');
		await user1.receiveAll();

		await sensus.call('joinSpace', [0], { caller: user1 });
		const passData = '5669746173656e73757871710000000000000000000000000000000000000000';

		const proposal = {
			title: 'title',
			description: 'description',
			startTime: 0,
			endTime: Math.floor(Date.now() / 1000) + 20,
			choices: [
				'5669746173656e73757300000000000000000000000000000000000000000000',
				'5669746173656e73757374000000000000000000000000000000000000000000',
			],
			choiceExecutors: [
				executor.address,
				'vite_0000000000000000000000000000000000000000a4f3a0cb58',
			],
			choiceDatas: [passData, '5669746173656e73757374000000000000000000000000000000000000000000'],
		};

		await sensus.call(
			'createProposal',
			[
				0,
				proposal.title,
				proposal.description,
				proposal.startTime,
				proposal.endTime,
				proposal.choices,
				proposal.choiceExecutors,
				proposal.choiceDatas,
			],
			{ caller: deployer }
		);

		await sensus.call('voteOnProposal', [0, 0, [10, 0]], {
			caller: user1,
			amount: '10000000000000000000',
		});

		await vuilder.utils.sleep(20000);

		await sensus.call('executeProposal', [0, 0], { caller: deployer });
		await executor.waitForHeight(2);

		// Only the first vote should have been counted
		const dataResult: any = await executor.query('data', [0, 0]);
		expect(dataResult).to.be.an('array');
		expect(dataResult).to.have.lengthOf(1);
		expect(dataResult[0]).to.equal(passData);

		// Should fail since it's been executed already
		await expect(
			sensus.call('executeProposal', [0, 0], { caller: deployer })
		).to.eventually.be.rejectedWith(/revert/);
	});

	it('should allow users redeem their tokens after voting has ended', async () => {
		await createSpace();

		await deployer.sendToken(user1.address, '11000000000000000000');
		await user1.receiveAll();
		const initialBalance = new BigNumber(await user1.balance());

		await sensus.call('joinSpace', [0], { caller: user1 });

		const proposal = {
			title: 'title',
			description: 'description',
			startTime: 0,
			endTime: Math.floor(Date.now() / 1000) + 20,
			choices: [
				'5669746173656e73757300000000000000000000000000000000000000000000',
				'5669746173656e73757374000000000000000000000000000000000000000000',
			],
			choiceExecutors: [
				'vite_0000000000000000000000000000000000000000a4f3a0cb58',
				'vite_0000000000000000000000000000000000000000a4f3a0cb58',
			],
			choiceDatas: [
				'5669746173656e73757300000000000000000000000000000000000000000000',
				'5669746173656e73757374000000000000000000000000000000000000000000',
			],
		};

		await sensus.call(
			'createProposal',
			[
				0,
				proposal.title,
				proposal.description,
				proposal.startTime,
				proposal.endTime,
				proposal.choices,
				proposal.choiceExecutors,
				proposal.choiceDatas,
			],
			{ caller: deployer }
		);

		await sensus.call('voteOnProposal', [0, 0, [10, 0]], {
			caller: user1,
			amount: '10000000000000000000',
		});

		let expectedBalance = initialBalance.minus(new BigNumber('10000000000000000000'));
		expect(new BigNumber(await user1.balance())).to.be.a.bignumber.that.equals(expectedBalance);

		await vuilder.utils.sleep(20000);

		await sensus.call('redeemVotedTokens', [0, 0, user1.address], { caller: deployer });
		expectedBalance = expectedBalance.plus(new BigNumber('10000000000000000000'));
		await user1.receiveAll();
		expect(new BigNumber(await user1.balance())).to.be.a.bignumber.that.equals(expectedBalance);

		await expect(
			sensus.call('redeemVotedTokens', [0, 0, user1.address], { caller: deployer })
		).to.eventually.be.rejectedWith(/revert/);
	});
});
