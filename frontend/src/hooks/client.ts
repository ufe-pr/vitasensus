import { useContext, useMemo } from 'react';
import { SensusClient } from '../client';
import { GlobalContext } from '../utils/globalContext';

export function useClient() {
	const {
		// @ts-ignore
		state: { callContract, queryContract, scanEvents, viteBalanceInfo, viteApi, vcInstance },
	} = useContext(GlobalContext);
	const client = useMemo(
		() =>
			new SensusClient(
				callContract,
				scanEvents,
				queryContract,
				viteBalanceInfo,
				viteApi,
				vcInstance?.accounts[0]
			),
		[callContract, scanEvents, queryContract, viteBalanceInfo, viteApi, vcInstance?.accounts]
	);

	return client;
}
