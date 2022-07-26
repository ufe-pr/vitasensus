import { useCallback, useEffect, useRef, useState } from 'react';
import { useProposals } from '../hooks/proposal';
import { useCurrentSpace } from '../hooks/space';
import { connect } from '../utils/globalContext';
import { PageLoader } from './Loader';
import { ProposalListItem } from './ProposalListItem';

const ProposalsList = () => {
	const space = useCurrentSpace();
	const [maxProposalCount, setMaxProposalsCount] = useState(10);

	const { data: proposals } = useProposals(space?.id, maxProposalCount);

	const updateCount = useCallback(() => {
		if ((proposals?.length ?? 0) >= maxProposalCount) setMaxProposalsCount(maxProposalCount + 10);
	}, [maxProposalCount, proposals?.length]);

	const loadingRef = useRef<Element>();

	useEffect(() => {
		var options = {
			root: null,
			rootMargin: '0px',
			threshold: 1.0,
		};

		const observer = new IntersectionObserver(updateCount, options);
		loadingRef.current && observer.observe(loadingRef.current);

		return () => observer.disconnect();
	}, [updateCount]);

	return (
		<>
			<h2>Proposals for {space?.name}</h2>
			{space?.description && (
				<div className="border-y border-skin-alt bg-skin-base text-base md:rounded-xl md:border p-4 md:p-6 leading-loose my-4 md:my-6 lg:my-8">
					{space?.description}
				</div>
			)}
			{!proposals && <PageLoader />}
			{proposals &&
				(proposals.length ? (
					<div className="my-4 md:space-y-6 lg:space-y-8">
						{space &&
							proposals.map((proposal) => (
								<ProposalListItem key={proposal.id} proposal={proposal} space={space} />
							))}
						{(proposals?.length ?? 0) >= maxProposalCount && (
							<div
								ref={(ref) => (loadingRef.current = ref || undefined)}
								style={{ height: '100px', margin: '30px' }}
							>
								<span>Loading...</span>
							</div>
						)}
					</div>
				) : (
					<div className="my-4">
						<p>There are no proposals at this time.</p>
					</div>
				))}
		</>
	);
};

export default connect(ProposalsList);
