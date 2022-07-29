import { ReactNode } from 'react';
import { DetailedSpace } from '../client/types';
import { PageLoader } from '../components/Loader';
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
			{space && <SpaceSidebar space={space as DetailedSpace} />}
			{!space && (
				<div className="w-full md:w-60 leading-5 sm:leading-6 shrink-0">
					<div className="border-y border-skin-alt bg-skin-base text-base md:rounded-xl md:border p-4 fy">
						<div className="h-20 w-20 rounded-full lazy-loading mb-4" />
						<div className="h-4 w-full lazy-loading mb-3 rounded-sm" />
						<div className="h-4 w-full lazy-loading mb-3 rounded-sm" />
						<div className="h-4 w-full lazy-loading rounded-sm" />
					</div>
				</div>
			)}
			{space && <div className="grow">{children}</div>}
			{!space && <PageLoader />}
		</div>
	);
};

export default connect(SingleSpace);
