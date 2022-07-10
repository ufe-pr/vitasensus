import { ReactNode } from 'react';
import { useParams } from 'react-router-dom';
import { Space } from '../client/types';
import SpaceSidebar from '../components/SpaceSidebar';
import { useSpace } from '../hooks/space';
import { connect } from '../utils/globalContext';
import { SpacesContext } from '../utils/SpacesContext';

type Props = {
	children: ReactNode | ReactNode[];
};

const SingleSpace = ({ children }: Props) => {
	const { spaceId } = useParams();
	const space = useSpace(Number.parseInt(spaceId ?? ''));
	return (
		<SpacesContext.Provider
			value={{ currentSpace: (space && space !== '404' && space) || undefined }}
		>
			<div className="flex flex-wrap md:flex-nowrap gap-4 md:gap-6 lg:gap-8">
				{space && space !== '404' && <SpaceSidebar space={space as Space} />}
				<div className="grow">{children}</div>
			</div>
		</SpacesContext.Provider>
	);
};

export default connect(SingleSpace);
