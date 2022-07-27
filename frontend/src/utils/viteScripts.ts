import { abi, utils } from '@vite/vitejs';
import { ViteAPI } from '@vite/vitejs/distSrc/utils/type';
import { waitFor } from './misc';
import { TokenInfo } from './types';

export const getPastEvents = async (
	viteApi: ViteAPI,
	contractAddress: string,
	contractAbi: any[],
	eventName: string = 'allEvents',
	{
		fromHeight = 0,
		toHeight = 0,
	}: {
		filter?: Object;
		fromHeight?: Number;
		toHeight?: Number;
	}
) => {
	let result: any[] = [];
	let logs = await viteApi.request('ledger_getVmLogsByFilter', {
		addressHeightRange: {
			[contractAddress!]: {
				fromHeight: fromHeight.toString(),
				toHeight: toHeight.toString(),
			},
		},
	});
	const filteredAbi =
		eventName === 'allEvents'
			? contractAbi
			: contractAbi.filter((a: any) => {
					return a.name === eventName;
			  });
	if (logs) {
		for (let log of logs) {
			let vmLog = log.vmlog;
			let topics = vmLog.topics;
			for (let abiItem of filteredAbi) {
				let signature = abi.encodeLogSignature(abiItem);
				if (abiItem.type === 'event' && signature === topics[0]) {
					let dataHex;
					if (vmLog.data) {
						dataHex = utils._Buffer.from(vmLog.data, 'base64').toString('hex');
					}
					let returnValues = abi.decodeLog(abiItem, dataHex, topics);
					let item = {
						returnValues: returnValues,
						event: abiItem.name,
						raw: {
							data: dataHex,
							topics: topics,
						},
						signature: signature,
						accountBlockHeight: log.accountBlockHeight,
						accountBlockHash: log.accountBlockHash,
						address: log.address,
					};
					result.push(item);
					break;
				}
			}
		}
	}
	return result;
};
export async function getAccountBlock(provider: any, hash?: string) {
	return provider.request('ledger_getAccountBlockByHash', hash);
}

export function getTokenInfo(provider: any, token: string): Promise<TokenInfo> {
	return provider.request('contract_getTokenInfoById', token);
}

export async function getBalance(
	provider: any,
	address: string,
	tokenId: string = 'tti_5649544520544f4b454e6e40'
) {
	const result = await provider.getBalanceInfo(address);
	const balance = result.balance.balanceInfoMap[tokenId].balance;
	return balance;
}

export async function isReceived(provider: any, hash?: string) {
	return getAccountBlock(provider, hash).then((block) => {
		if (!block) {
			return false;
		} else {
			if (!block.receiveBlockHash) {
				return false;
			} else {
				return true;
			}
		}
	});
}

export async function confirmCallContract(provider: any, block: any) {
	await waitFor(
		() => {
			return isReceived(provider, block.hash);
		},
		1000,
		60
	);

	const sendBlock = await getAccountBlock(provider, block.hash);
	const receiveBlock = await getAccountBlock(provider, sendBlock.receiveBlockHash);

	if (!receiveBlock) {
		throw new Error('receive block not found');
	}
	if ((receiveBlock.blockType !== 4 && receiveBlock.blockType !== 5) || !receiveBlock.data) {
		throw new Error('bad recieve block');
	}
	const data = receiveBlock.data;
	const bytes = Buffer.from(data, 'base64');
	if (bytes.length !== 33) {
		throw new Error('bad data in recieve block');
	}
	// parse error code from data in receive block
	const errorCode = bytes[32];
	switch (errorCode) {
		case 1:
			throw new Error(`revert`); // @todo: need error descriptions and debug info from RPC
		case 2:
			throw new Error(`maximum call stack size exceeded`);
	}

	return receiveBlock;
}
