import { useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { DetailedSpace, Space, SpaceSettings } from '../client/types';
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

	useEffect(() => {
		setSpace(null);
		setSpaceNotFound(false);
	}, [client, id]);

	useEffect(() => {
		client
			.getSpace(id)
			.then(
				async (space) => {
					if (space) {
						!space.admins?.length && (await client.loadSpaceAdmins(id));
						!space.description && (await client.loadSpaceDescription(id));
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

export function useSpaceSettings(id?: number): SpaceSettings | null | '404' {
	const [spaceSettings, setSpaceSettings] = useState<SpaceSettings | null>(null);
	const [spaceNotFound, setSpaceNotFound] = useState<boolean>(false);
	const client = useClient();

	useEffect(() => {
		setSpaceSettings(null);
		setSpaceNotFound(false);
	}, [client, id]);

	useEffect(() => {
		id !== null &&
			id !== undefined &&
			client
				.getSpaceSettings(id)
				.then(
					async (settings) => settings ?? null,
					(e) => null
				)
				.then((settings) => {
					!settings && setSpaceNotFound(true);
					settings && setSpaceSettings(settings);
					settings && setSpaceNotFound(false);
				});
	}, [client, id]);

	return spaceNotFound ? '404' : spaceSettings;
}

export function useIsSpaceAdmin(id?: number): boolean {
	const client = useClient();
	const [isAdmin, setIsAdmin] = useState(false);

	useEffect(() => {
		setIsAdmin(false);
	}, [client, id]);

	useEffect(() => {
		id !== null &&
			id !== undefined &&
			client
				.isSpaceAdmin(id)
				.then(
					(isAdmin) => isAdmin,
					(e) => false
				)
				.then((isAdmin) => setIsAdmin(isAdmin));
	}, [client, id]);

	return isAdmin;
}

export function useRedeemCreationFee(id?: number) {
	const client = useClient();
	const [canRedeemFee, setCanRedeemFee] = useState(false);

	useEffect(() => {
		setCanRedeemFee(false);
	}, [client, id]);

	useEffect(() => {
		id !== null &&
			id !== undefined &&
			client
				.canRedeemSpaceCreationFee(id)
				.then(
					(canRedeem) => canRedeem,
					(e) => false
				)
				.then((canRedeem) => setCanRedeemFee(canRedeem));
	}, [client, id]);

	const redeemFee = useCallback(async () => {
		if (!id && id !== 0) return;
		await client.redeemSpaceCreationFee(id);
		setCanRedeemFee(false);
	}, [client, id]);

	return { canRedeemFee, redeemFee };
}

export function useUserInSpace(spaceId?: number): boolean {
	const { userSpaces } = useContext(SpacesContext);
	const joined = useMemo(
		() => spaceId !== null && spaceId !== undefined && !!userSpaces.find((s) => s.id === spaceId),
		[spaceId, userSpaces]
	);

	return joined;
}

export function useSpaces(count: number = 20): { data?: Space[]; error?: object } {
	const client = useClient();
	const [spaces, setSpaces] = useState<Space[]>();
	const [resultsEnd, setResultsEnd] = useState(false);
	const [error, setError] = useState<object>();

	useEffect(() => {
		setSpaces([]);
		setResultsEnd(false);
		setError(undefined);
	}, [client]);

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
