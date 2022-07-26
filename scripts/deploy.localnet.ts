import { expect } from 'chai';
import * as vuilder from '@vite/vuilder';
import config from './deploy.config.localnet.json';

async function run(): Promise<void> {
	const provider = vuilder.newProvider(config.http);
	console.log(await provider.request('ledger_getSnapshotChainHeight'));
	const deployer = vuilder.newAccount(config.mnemonic, 0, provider);

	// compile
	const compiledContracts = await vuilder.compile('Vitasensus.solpp');
	expect(compiledContracts).to.have.property('Vitasensus');

	// deploy
	let vitasensus = compiledContracts.Vitasensus;
	vitasensus.setDeployer(deployer).setProvider(provider);
	await vitasensus.deploy({ responseLatency: 1 }).catch((e: any) => console.log(e));
	// expect(vitasensus.address).to.be.a('string');
	console.log(vitasensus.address);

	// stake quota
	// await deployer.stakeForQuota({beneficiaryAddress: vitasensus.address, amount:"2001000000000000000000"});

	return;
}

run().then(() => {
	console.log('done');
});
