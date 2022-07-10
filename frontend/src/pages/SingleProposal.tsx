import { Link, useParams } from 'react-router-dom';
import { DetailedSpace, Proposal, Space } from '../client/types';
import { Block } from '../components/Block';
import { Markdown } from '../components/Markdown';
import { ProposalStateLabel } from '../components/ProposalStateLabel';
import SpaceAvatar from '../components/SpaceAvatar';
import { SpaceProposalDiscussionLink } from '../components/SpaceProposalDiscussionLink';
import { SpaceProposalResults } from '../components/SpaceProposalResults';
import { SpaceProposalVote } from '../components/SpaceProposalVote';
import { SpaceProposalVotesList } from '../components/SpaceProposalVotesList';
import { User } from '../components/User';
import { useProposal } from '../hooks/proposal';
import { useSpace } from '../hooks/space';
import { connect } from '../utils/globalContext';

const RightSidebar = ({ proposal, space }: { proposal: Proposal; space: DetailedSpace }) => {
	const startDate = new Date();
	const endDate = new Date(startDate.valueOf() - 86400 * 1000);
	return (
		<div className="w-full lg:w-4/12 lg:min-w-[321px] space-y-4 md:space-y-6">
			<Block title="Information">
				<div className="space-y-2">
					<SidebarTile label="Voting System" value="Weighted voting" />
					<SidebarTile label="Start date" value={startDate.toLocaleDateString()} />
					<SidebarTile label="End date" value={endDate.toLocaleDateString()} />
				</div>
			</Block>
			<SpaceProposalResults proposal={proposal} />
		</div>
	);
};

const MainContent = ({ proposal, space }: { proposal: Proposal; space: DetailedSpace }) => {
	return (
		<div className="relative w-full lg:w-8/12 lg:pr-5">
			<div className="px-3 md:px-0">
				<div>
					<h1 className="mb-3 break-words text-xl leading-8 sm:text-2xl">{proposal.title}</h1>
					<div className="mb-4 flex flex-col sm:flex-row sm:space-x-1">
						<div className="mb-1 flex items-center sm:mb-0">
							<ProposalStateLabel state={proposal.state} />
							<Link className="group text-skin-text ml-3" to="">
								<div className="flex items-center">
									<div className="h-10 w-10">
										<SpaceAvatar space={space} />
									</div>
									<span className="ml-2 group-hover:text-skin-link" v-text="">
										{space.name}
									</span>
								</div>
							</Link>
						</div>

						<div className="flex grow items-center space-x-1">
							<span>by</span>
							<User address={proposal.author} hide-avatar />
						</div>
					</div>
					{proposal.description.length && (
						<div className="relative">
							<div className="overflow-hidden mb-24">
								<Markdown markdown={proposal.description} />
							</div>
						</div>
					)}
				</div>
			</div>
			<div className="space-y-4">
				<SpaceProposalDiscussionLink
					v-if="proposal?.discussion"
					className="px-3 md:px-0"
					discussion-link="proposal.discussion"
				/>
				<SpaceProposalVote
					// v-if="proposal?.state === 'active'"
					// v-model="selectedChoices"
					proposal={proposal as Proposal}
					// open="modalOpen = true"
					// clickVote="clickVote"
				/>
				<SpaceProposalVotesList
					// v-if="proposal && !loadingResultsFailed"
					proposal={proposal as Proposal}
					votes={new Array(20).fill(10).map((_, i) => ({
						id: i,
						author: (proposal as Proposal).author,
						amount: i,
						choices: (proposal as Proposal).choices.map((_, i) => i),
						proposal: i,
						space: '',
					}))}
					token={(space as Space).token}
					// loaded="loadedVotes"
					// space="space"
					// votes="votes"
					// strategies="strategies"
					// user-vote="userVote"
					// loading-more="loadingMore"
					// loadVotes="loadMore(loadMoreVotes)"
				/>
			</div>
		</div>
	);
};

const SingleProposal = () => {
	const { spaceId, proposalId } = useParams();
	const space = useSpace(Number.parseInt(spaceId ?? '') ?? '');
	const proposal = useProposal(Number.parseInt(spaceId ?? ''), Number.parseInt(proposalId ?? ''));

	if (!proposal || !space || space === '404' || proposal === '404') return <div />;

	return (
		<div className="lg:flex">
			<MainContent proposal={proposal} space={space} />
			<RightSidebar proposal={proposal} space={space} />
		</div>
	);
};

export default connect(SingleProposal);
function SidebarTile({ label, value }: { label: string; value: string }) {
	return (
		<div>
			<b>{label}</b>
			<span className="float-right">{value}</span>
		</div>
	);
}
