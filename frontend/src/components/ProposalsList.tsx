import { Proposal, ProposalState } from '../client/types';
import { useProposals } from '../hooks/proposal';
import { useCurrentSpace } from '../hooks/space';
import { connect } from '../utils/globalContext';
import { ProposalListItem } from './ProposalListItem';

const ProposalsList = () => {
	const space = useCurrentSpace();
	const { data: proposals } = useProposals(space?.id ?? 0);
	return (
		<>
			<h2>Proposals for {space?.name}</h2>
			{space?.description && (
				<div className="border-y border-skin-alt bg-skin-base text-base md:rounded-xl md:border p-4 md:p-6 leading-loose my-4 md:my-6 lg:my-8">
					{space?.description}
				</div>
			)}
			<div className="my-4 md:space-y-6 lg:space-y-8">
				{space &&
					proposals &&
					proposals.map((proposal) => <ProposalListItem proposal={proposal} space={space} />)}
			</div>
		</>
	);
};

export default connect(ProposalsList);
