import { useContext, useMemo } from 'react';
import { SensusClient } from '../client';
import { GlobalContext } from '../utils/globalContext';

export function useClient() {
	const {
		// @ts-ignore
		state: { callContract, queryContract, scanEvents },
	} = useContext(GlobalContext);
	const client = useMemo(
		() => new SensusClient(callContract, scanEvents , queryContract),
		[callContract, scanEvents, queryContract]
	);

	return client;
}
