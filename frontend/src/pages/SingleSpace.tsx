import { ReactNode } from 'react';
import { Space } from '../client/types';
import SpaceSidebar from '../components/SpaceSidebar';
import { useCurrentSpace } from '../hooks/space';
import { connect } from '../utils/globalContext';

type Props = {
	children: ReactNode | ReactNode[];
};

const SingleSpace = ({ children }: Props) => {
	const space = useCurrentSpace();
	return (
		<div className="flex flex-wrap md:flex-nowrap gap-4 md:gap-6 lg:gap-8">
			{space && <SpaceSidebar space={space as Space} />}
			<div className="grow">{children}</div>
		</div>
	);
};

export default connect(SingleSpace);
