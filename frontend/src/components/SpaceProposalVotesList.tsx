import { Proposal, Token, Vote } from '../client/types';
import { formatNumberCompact } from '../utils/misc';
import { Block } from './Block';
import { PrimaryButton } from './PrimaryButton';
import { User } from './User';

export const SpaceProposalVotesList = ({
	proposal,
	votes,
	token,
}: {
	proposal?: Proposal;
	votes: Vote[];
	token: Token;
	className?: string;
}) => {
	function format(proposal: Proposal, choices: number[]): string {
		return '';
	}
	return !proposal || !votes || !votes.length ? (
		<></>
	) : (
		<Block title="Votes" slim>
			{votes.map((vote, i) => (
				<div className={'flex items-center border-b border-skin-alt px-3 py-[14px]'}>
					<User address={vote.author} />
					<div className="flex-auto truncate px-2 text-center text-skin">
						<div className="truncate text-center">{format(proposal, vote.choices)}</div>
					</div>
					<div className="flex min-w-[110px] items-center justify-end whitespace-nowrap text-right text-skin-link xs:min-w-[130px]">
						<span>{`${formatNumberCompact(vote.amount)} ${token.name}`}</span>
					</div>
				</div>
			))}
			<div className="px-3 py-4">
				<PrimaryButton
					// v-if="
					// 	isFinalProposal
					// 	? sortedVotes.length < voteCount
					// 	: sortedVotes.length > 10 && nbrVisibleVotes < sortedVotes.length
					// "
					// data-click="isFinalProposal ? $emit('loadVotes') : (nbrVisibleVotes += 10)"
				>
					{/* <LoadingSpinner v-if="loadingMore" /> */}
					{/*v-else */}<span  v-text="$t('seeMore')">
						See more
					</span>
				</PrimaryButton>
			</div>
		</Block>
	);
};
