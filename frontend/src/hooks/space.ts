import { useContext, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { DetailedSpace, Space } from '../client/types';
import { SpacesContext } from '../utils/SpacesContext';
import { useClient } from './client';

export function useJoinSpace(): (id: number) => Promise<void> {
	const navigate = useNavigate();
	const client = useClient();

	return async (id) => {
		await client.joinSpace(id);
		navigate('/space/' + id, { replace: false });
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

	console.log('useSpace', id);
	console.log('useSpace', space);
	console.log('useSpace', spaceNotFound);

	useEffect(() => {
		client
			.getSpace(id)
			.then(
				async (space) => {
					if (space) {
						!space.admins?.length && (await client.loadSpaceAdmins(id));
						!space.description && (await client.loadSpaceDescription(id));
						space.members?.length !== space.memberCount && (await client.loadSpaceMembers(id));
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
				space && setSpace(space);
				space && setSpaceNotFound(false);
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
		if (resultsEnd) return;
		if ((spaces?.length ?? 0) >= count) return;

		client
			.getSpaces({ skip: spaces?.length ?? 0, limit: count - (spaces?.length ?? 0) })
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
