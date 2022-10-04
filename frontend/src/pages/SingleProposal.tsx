import { useCallback, useEffect, useRef, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { DetailedSpace, Proposal, ProposalState, Space } from '../client/types';
import { Block } from '../components/Block';
import { Loader, PageLoader } from '../components/Loader';
import { Markdown } from '../components/Markdown';
import { PrimaryButton } from '../components/PrimaryButton';
import { ProposalStateLabel } from '../components/ProposalStateLabel';
import SpaceAvatar from '../components/SpaceAvatar';
import { SpaceProposalResults } from '../components/SpaceProposalResults';
import { SpaceProposalVote } from '../components/SpaceProposalVote';
import { SpaceProposalVotesList } from '../components/SpaceProposalVotesList';
import { User } from '../components/User';
import { useClient } from '../hooks/client';
import { useProposal } from '../hooks/proposal';
import { useSpace } from '../hooks/space';
import { useVotes } from '../hooks/vote';
import { connect } from '../utils/globalContext';
import { formatDate } from '../utils/strings';

const RightSidebar = ({ proposal, space }: { proposal: Proposal; space: DetailedSpace }) => {
	const startDate = new Date(proposal.start * 1000);
	const endDate = new Date(proposal.end * 1000);
	const [executeProposalLoading, setExecuteProposalLoading] = useState(false);
	const [executedProposal, setExecutedProposal] = useState(true);
	const client = useClient();

	useEffect(() => {
		client.isProposalExecuted(proposal.spaceId, proposal.id).then((executed) => {
			setExecutedProposal(executed);
		});
	}, [client, proposal.id, proposal.spaceId]);

	const executeProposal = useCallback(() => {
		setExecuteProposalLoading(true);
		client
			.executeProposal(proposal.spaceId, proposal.id)
			.then(() => {
				setExecutedProposal(true);
			})
			.finally(() => setExecuteProposalLoading(false));
	}, [client, proposal.id, proposal.spaceId]);

	return (
		<div className="w-full lg:w-4/12 lg:min-w-[321px] space-y-4 md:space-y-6">
			<Block title="Information">
				<div className="space-y-2">
					<SidebarTile label="Voting System" value="Weighted voting" />
					<SidebarTile label="Start date" value={formatDate(startDate) ?? ''} />
					<SidebarTile label="End date" value={formatDate(endDate) ?? ''} />
				</div>
			</Block>
			<SpaceProposalResults proposal={proposal} space={space} />
			{proposal.state === ProposalState.closed && !executedProposal && (
				<PrimaryButton disabled={executeProposalLoading} onClick={executeProposal}>
					{executeProposalLoading ? (
						<>
							<Loader /> Loading...
						</>
					) : (
						'Execute proposal'
					)}
				</PrimaryButton>
			)}
		</div>
	);
};

const MainContent = ({ proposal, space }: { proposal: Proposal; space: DetailedSpace }) => {
	const [maxVotesCount, setMaxVotesCount] = useState(10);
	const { data: votes } = useVotes(proposal.spaceId, proposal.id, maxVotesCount);

	const updateCount = useCallback(() => {
		if ((votes?.length ?? 0) >= maxVotesCount) setMaxVotesCount(maxVotesCount + 10);
	}, [maxVotesCount, votes?.length]);

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
	const onVoteSubmitted = useCallback(() => {
		window.location.reload();
	}, []);

	return (
		<div className="relative w-full lg:w-8/12 lg:pr-5">
			<div className="px-3 md:px-0">
				<div>
					<h1 className="mb-3 break-words text-xl leading-8 sm:text-2xl">{proposal.title}</h1>
					<div className="mb-4 flex flex-col sm:flex-row sm:space-x-1 text-skin-muted">
						<div className="mb-1 flex items-center sm:mb-0">
							<ProposalStateLabel state={proposal.state} />
							<Link className="group text-skin-text ml-3" to={'/space/' + space.id}>
								<div className="flex items-center">
									<div className="h-10 w-10">
										<SpaceAvatar space={space} />
									</div>
									<span
										className="ml-2 text-skin-secondary group-hover:text-skin-primary"
										v-text=""
									>
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
				{proposal.state === ProposalState.active && (
					<SpaceProposalVote proposal={proposal} onVoteSubmitted={onVoteSubmitted} />
				)}
				{votes && (
					<SpaceProposalVotesList
						proposal={proposal as Proposal}
						votes={votes}
						token={(space as Space).token}
					/>
				)}
			</div>
		</div>
	);
};

const SingleProposal = () => {
	const { spaceId, proposalId } = useParams();
	const space = useSpace(Number.parseInt(spaceId ?? '') ?? '');
	const proposal = useProposal(Number.parseInt(spaceId ?? ''), Number.parseInt(proposalId ?? ''));

	if (!proposal || !space || space === '404' || proposal === '404') return <PageLoader />;

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
