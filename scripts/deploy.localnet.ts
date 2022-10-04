import { expect } from 'chai';
import * as vuilder from '@vite/vuilder';
import * as vitejs from '@vite/vitejs';
import config from './deploy.config.localnet.json';

async function run(): Promise<void> {
	const provider = vuilder.newProvider(config.http);
	console.log(await provider.request('ledger_getSnapshotChainHeight'));
	const addressObject = vitejs.wallet.createAddressByPrivateKey(config.privateKey);
	const deployer = new vitejs.account.Account(addressObject.address)
	deployer.setPrivateKey(addressObject.privateKey);
	deployer.setProvider(provider);

	// compile
	const compiledContracts = await vuilder.compile('Vitasensus.solpp');
	expect(compiledContracts).to.have.property('Vitasensus');

	// deploy
	let vitasensus = compiledContracts.Vitasensus;
	vitasensus.setDeployer(deployer).setProvider(provider);
	await vitasensus.deploy({ responseLatency: 1 }).catch((e: any) => console.log(e));
	// expect(vitasensus.address).to.be.a('string');
	console.log("Deploy successful!");
	console.log("Contract address:", vitasensus.address);

	// stake quota
	await deployer.stakeForQuota({beneficiaryAddress: vitasensus.address, amount:"1000000000000000000000"}).autoSend();
	console.log("Successfully staked VITE for quota");
	console.log("VITE staked:", "1000000000000000000000");

	return;
}

run().then(() => {
	console.log('done');
});
