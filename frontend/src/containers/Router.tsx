import { useCallback, useEffect, useMemo } from 'react';
import { BrowserRouter, Route, Routes, Navigate } from 'react-router-dom';
import WS_RPC from '@vite/vitejs-ws';
// @ts-ignore
import HTTP_RPC from '@vite/vitejs-http';
import { accountBlock, ViteAPI, abi } from '@vite/vitejs';
import { connect } from '../utils/globalContext';
import { State, ViteBalanceInfo } from '../utils/types';
import Toast from './Toast';
import { VCSessionKey } from '../utils/viteConnect';
import { PROD } from '../utils/constants';
import PageContainer from './PageContainer';
import CafeContract from '../contracts/Cafe';
import Spaces from '../pages/Spaces';
import SingleSpace from '../pages/SingleSpace';
import ProposalsList from '../components/ProposalsList';
import SingleProposal from '../pages/SingleProposal';
import CreateSpace from '../pages/CreateSpace';
import SpaceCreateProposal from '../components/SpaceCreateProposal';
import { confirmCallContract, getPastEvents } from '../utils/viteScripts';
import { SpacesContextProvider } from '../utils/SpacesContext';

const providerWsURLs = {
	...(PROD ? {} : { localnet: 'ws://localhost:23457' }),
	testnet: 'wss://buidl.vite.net/gvite/ws',
	mainnet: 'wss://node.vite.net/gvite/ws', // or 'wss://node-tokyo.vite.net/ws'
};
const providerTimeout = 60000;
const providerOptions = { retryTimes: 10, retryInterval: 5000 };

type Props = State;

const Router = ({ setState, vcInstance, networkType, viteBalanceInfo }: Props) => {
	const connectedAccount = useMemo(() => vcInstance?.accounts[0], [vcInstance]);

	const rpc = useMemo(() => {
		const url =
			providerWsURLs[networkType] ||
			(networkType === 'mainnet' ? providerWsURLs.mainnet : providerWsURLs.testnet);

		return url.startsWith('ws')
			? new WS_RPC(url, providerTimeout, providerOptions)
			: new HTTP_RPC(url, providerTimeout, providerOptions);
	}, [networkType]);

	const viteApi = useMemo(() => {
		return new ViteAPI(rpc, () => {
			// console.log('client connected');
		});
	}, [rpc]);

	useEffect(() => setState({ viteApi }), [setState, viteApi]);

	const getBalanceInfo = useCallback(
		(address: string) => {
			return viteApi.getBalanceInfo(address);
		},
		[viteApi]
	);

	const subscribe = useCallback(
		(event: string, ...args: any) => {
			return viteApi.subscribe(event, ...args);
		},
		[viteApi]
	);

	const updateViteBalanceInfo = useCallback(() => {
		if (vcInstance?.accounts[0]) {
			getBalanceInfo(vcInstance.accounts[0])
				// @ts-ignore
				.then((res: ViteBalanceInfo) => {
					setState({ viteBalanceInfo: res });
				})
				.catch((e) => {
					console.log(e);
					setState({ toast: JSON.stringify(e), vcInstance: null });
					localStorage.removeItem(VCSessionKey);
					// Sometimes on page load, this will catch with
					// Error: CONNECTION ERROR: Couldn't connect to node wss://buidl.vite.net/gvite/ws.
				});
		}
	}, [setState, getBalanceInfo, vcInstance]);

	useEffect(updateViteBalanceInfo, [updateViteBalanceInfo]);

	useEffect(() => {
		if (vcInstance) {
			subscribe('newAccountBlocksByAddr', vcInstance.accounts[0])
				.then((event: any) => {
					event.on(() => {
						updateViteBalanceInfo();
					});
				})
				.catch((err: any) => console.warn(err));
		}
		return () => viteApi.unsubscribeAll();
	}, [setState, subscribe, vcInstance, viteApi, updateViteBalanceInfo]);

	const callContract = useCallback(
		async (
			contract: typeof CafeContract,
			methodName: string,
			params: any[] = [],
			tokenId?: string,
			amount?: string
		) => {
			if (!vcInstance) {
				return;
			}
			const methodAbi = contract.abi.find(
				(x: any) => x.name === methodName && x.type === 'function'
			);
			if (!methodAbi) {
				throw new Error(`method not found: ${methodName}`);
			}
			const toAddress = contract.address[networkType];
			if (!toAddress) {
				throw new Error(`${networkType} contract address not found`);
			}
			const block = accountBlock.createAccountBlock('callContract', {
				address: connectedAccount,
				abi: methodAbi,
				toAddress,
				params,
				tokenId,
				amount,
			}).accountBlock;
			const sendBlock = await vcInstance.signAndSendTx([{ block }]);
			return await confirmCallContract(viteApi, sendBlock);
		},
		[connectedAccount, networkType, vcInstance, viteApi]
	);
	useEffect(() => {
		setState({ callContract });
	}, [setState, callContract]);

	const queryContract = useCallback(
		async (contract: typeof CafeContract, methodName: string, params: any[] = []) => {
			if (!viteApi) {
				return;
			}
			const methodAbi: any = contract.abi.find(
				(x: any) => x.name === methodName && x.type === 'function'
			);
			if (!methodAbi) {
				throw new Error(`method not found: ${methodName}`);
			}
			const toAddress = contract.address[networkType];
			if (!toAddress) {
				throw new Error(`${networkType} contract address not found`);
			}
			let data = abi.encodeFunctionCall(methodAbi, params);
			let dataBase64 = Buffer.from(data, 'hex').toString('base64');

			let result = await viteApi.request('contract_query', {
				address: toAddress,
				data: dataBase64,
			});
			console.log('queryContract result: ', result);

			// parse result
			if (result) {
				let resultBytes = Buffer.from(result, 'base64').toString('hex');
				let outputs = [];
				for (let i = 0; i < methodAbi.outputs.length; i++) {
					outputs.push(methodAbi.outputs[i].type);
				}
				return abi.decodeParameters(outputs, resultBytes);
			}

			throw new Error('Query failed');
		},
		[networkType, viteApi]
	);

	useEffect(() => {
		setState({ queryContract });
	}, [setState, queryContract]);

	const scanEvents = useCallback(
		(contract: typeof CafeContract, fromHeight: string, eventName: string) => {
			if (!viteApi) {
				return;
			}
			const contractAbi = contract.abi;
			const addr = contract.address[networkType];
			return getPastEvents(viteApi, addr, contractAbi, eventName, {
				fromHeight: Number.parseInt(fromHeight),
			});
		},
		[networkType, viteApi]
	);

	useEffect(() => {
		setState({ scanEvents });
	}, [setState, scanEvents]);

	console.log('ViteBalanceInfo: ', viteBalanceInfo);

	return (
		<BrowserRouter>
			<SpacesContextProvider>
				<PageContainer>
					<Routes>
						<Route path="/" element={<Spaces />} />
						<Route path="/create" element={<CreateSpace />} />
						<Route path="/space/:spaceId/">
							<Route
								index
								element={
									<SingleSpace>
										<ProposalsList />
									</SingleSpace>
								}
							/>
							<Route path="proposals/:proposalId" element={<SingleProposal />} />
							<Route
								path="create"
								element={
									<SingleSpace>
										<SpaceCreateProposal />
									</SingleSpace>
								}
							/>
						</Route>

						<Route path="*" element={<Navigate to="/" />} />
					</Routes>
				</PageContainer>
			</SpacesContextProvider>
			<Toast />
		</BrowserRouter>
	);
};

export default connect(Router);
