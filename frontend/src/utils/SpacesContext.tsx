import { createContext, ReactNode, useEffect, useState } from 'react';
import { useMatch } from 'react-router-dom';
import { DetailedSpace, Space } from '../client/types';
import { useClient } from '../hooks/client';
import { useSpace } from '../hooks/space';

export const SpacesContext = createContext<{
	currentSpace?: DetailedSpace;
	userSpaces: Space[];
	setUserSpaces: (x: Space[]) => void;
}>({
	userSpaces: [],
	setUserSpaces: () => {},
});

export const SpacesContextProvider = ({ children }: { children: ReactNode | ReactNode[] }) => {
	const client = useClient();
	const match = useMatch('/space/:spaceId/*');
	const spaceId = match?.params.spaceId;

	const space = useSpace(Number.parseInt(spaceId ?? ''));
	

	const [userSpaces, setUserSpaces] = useState<Space[]>([]);

	useEffect(() => {
		if (client) {
			client.getUserSpaces().then((spaces) => {
				setUserSpaces(spaces);
			});
		} else {
			setUserSpaces([]);
		}
	}, [client]);
	return (
		<SpacesContext.Provider
			value={{
				currentSpace: (space && space !== '404' && space) || undefined,
				userSpaces,
				setUserSpaces,
			}}
		>
			{children}
		</SpacesContext.Provider>
	);
};
