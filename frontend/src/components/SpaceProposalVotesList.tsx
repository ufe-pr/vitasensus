import { Proposal, Token, Vote } from '../client/types';
import { formatNumberCompact } from '../utils/misc';
import { Block } from './Block';
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
		return choices
			.map((choice, i) => `${formatNumberCompact(choice)} for ${proposal.choices[i]}`)
			.join(', ');
	}
	return !proposal || !votes || !votes.length ? (
		<></>
	) : (
		<Block title="Votes" slim>
			{votes.map((vote, i) => (
				<div key={i} className={'flex items-center border-b border-skin-alt px-3 py-[14px]'}>
					<User address={vote.author} />
					<div className="flex-auto truncate px-2 text-center text-skin">
						<div className="truncate text-center">{format(proposal, vote.choices)}</div>
					</div>
					<div className="flex min-w-[110px] items-center justify-end whitespace-nowrap text-right text-skin-link xs:min-w-[130px]">
						<span>{`${formatNumberCompact(vote.amount)} ${token.symbol}`}</span>
					</div>
				</div>
			))}
		</Block>
	);
};
