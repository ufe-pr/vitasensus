import { Proposal, Space } from '../client/types';
import { formatNumberCompact, formatNumberPercentage } from '../utils/misc';
import { Block } from './Block';

export const SpaceProposalResults = ({ proposal, space }: { proposal: Proposal; space: Space }) => {
	const { choicesVotesCounts: votes } = proposal;
	const totalVotes = votes.reduce((acc, vote) => acc + vote, 0);

	return (
		<Block title="Results" slim>
			<div className="space-y-3">
				{proposal.choices.map((choice, index) => (
					<div
						key={index}
						className="flex items-center border-b border-skin-alt px-4 md:px-6 py-[14px]"
					>
						<div className="w-full mb-1 flex justify-between text-skin-link">
							<div className="flex overflow-hidden">
								<span className="mr-1 truncate">{choice}</span>
							</div>
							<div className="flex justify-end space-x-2">
								<span className="whitespace-nowrap">
									{formatNumberCompact(votes[index])} {space.token.symbol}
								</span>{' '}
								{totalVotes ? (
									<span>{formatNumberPercentage(votes[index] / totalVotes)}</span>
								) : null}
							</div>
						</div>
					</div>
				))}
			</div>
		</Block>
	);
};
