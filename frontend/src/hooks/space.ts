import { useContext, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { DetailedSpace, Space } from '../client/types';
import { SpacesContext } from '../utils/SpacesContext';
import { useClient } from './client';

export function useJoinSpace(): (id: number) => Promise<void> {
	const navigate = useNavigate();
	return async (name) => {
		// TODO: Join the space on blockchain and update local state
		navigate('/space/' + name, { replace: false });
	};
}

export function useGoToSpace(): (id: number) => Promise<void> {
	const navigate = useNavigate();
	return async (id) => {
		navigate('/space/' + id);
	};
}

export function useSpace(id: number): DetailedSpace | null | '404' {
	const [space, setSpace] = useState<DetailedSpace | null>(null);
	const [spaceNotFound, setSpaceNotFound] = useState<boolean>(false);
	const client = useClient();

	useEffect(() => {
		client
			.getSpace(id)
			.then(
				async (space) => {
					if (space) {
						!space.admins?.length && (await client.loadSpaceAdmins(id));
						!space.description && (await client.loadSpaceDescription(id));
						space.members?.length !== space.memberCount && (await client.loadSpaceMembers(id));
						!space.token.symbol && (await client.loadTokenDetails(id));
						return client.getSpace(id);
					}
					return null;
				},
				(e) => {
					return null;
				}
			)
			.then((space) => {
				!space && setSpaceNotFound(true);
				setSpace(space);
			});
	}, [client, id]);

	return spaceNotFound ? '404' : space;
}

export function useAddressInSpace(address: string, name: string): boolean {
	return false;
}

export function useSpaces(count: number = 20): { data?: Space[]; error?: object } {
	const client = useClient();
	const [spaces, setSpaces] = useState<Space[]>();
	const [resultsEnd, setResultsEnd] = useState(false);
	const [error, setError] = useState<object>();

	useEffect(() => {
		// client.createSpace('Vite', '', 'tti_5649544520544f4b454e6e40', '', '');
		if (resultsEnd) return;
		if ((spaces?.length ?? 0) >= count) return;

		client
			.getSpaces({ skip: spaces?.length! })
			.then((results) => {
				if (results.length === 0) {
					setResultsEnd(true);
				} else {
					setSpaces([...(spaces ?? []), ...results]);
				}
			})
			.catch((e) => {
				setError(e);
			});
	}, [spaces, setSpaces, count, resultsEnd, client]);
	return {
		data: spaces,
		error: error,
	};
}

export function useCurrentSpace(): DetailedSpace | null {
	const { currentSpace } = useContext(SpacesContext);
	return currentSpace || null;
}
