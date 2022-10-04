import { useContext, useMemo } from 'react';
import { SensusClient } from '../client';
import { GlobalContext } from '../utils/globalContext';

export function useClient() {
	const {
		// @ts-ignore
		state: { callContract, queryContract, scanEvents, viteApi, serverViteApi, serverURL, vcInstance, signMessage },
	} = useContext(GlobalContext);
	const client = useMemo(
		() =>
			new SensusClient(
				callContract,
				scanEvents,
				queryContract,
				serverViteApi,
				viteApi,
				vcInstance?.accounts[0],
				signMessage,
				serverURL,
			),
		[callContract, scanEvents, queryContract, serverViteApi, viteApi, serverURL, vcInstance?.accounts, signMessage]
	);

	return client;
}
