import { useCallback, useContext, useEffect, useState } from 'react';
import { Proposal } from '../client/types';
import { Block } from './Block';
import { PrimaryButton } from './PrimaryButton';
import { useClient } from '../hooks/client';
import { Loader } from './Loader';
import { useUserInSpace } from '../hooks/space';
import { GlobalContext } from '../utils/globalContext';

export const SpaceProposalVote = ({
	proposal,
	onVoteSubmitted,
}: {
	proposal?: Proposal;
	className?: string;
	onVoteSubmitted: () => void;
}) => {
	const [selectedChoice, setSelectedChoice] = useState<number | null>(null);
	const [loading, setLoading] = useState(false);
	const client = useClient();
	const inSpace = useUserInSpace(proposal?.spaceId);
	const [_, rebuild] = useState({});
	const [votingPower, setVotingPower] = useState(0);
	const {
		// @ts-ignore
		state: { vcInstance,  },
	} = useContext(GlobalContext);

	useEffect(() => {
		(async () => {
			Object.keys(_);
			if (!proposal) return 0;
			console.log(proposal);
			
			const votingPower = await client.getVotingPower(proposal.spaceId, proposal.snapshot);
			if (votingPower) {
				return votingPower;
			}
			return 0;
		})().then(setVotingPower);
	}, [client, proposal, _]);
	
	const [hasVoted, setHasVoted] = useState<boolean | null>(null);

	useEffect(() => {
		(async () => {
			Object.keys(_);
			console.log(vcInstance);
			
			if (!proposal || !vcInstance) return null;
			console.log(proposal);
			
			const hasVoted = await client.hasUserVoted(proposal.spaceId, proposal.id, vcInstance.accounts[0]);
			return hasVoted;
			
		})().then((e) => setHasVoted(e));
	}, [client, proposal, _, vcInstance]);

	useEffect(() => {
		setSelectedChoice(null);
	}, []);

	useEffect(() => {
		proposal && client.getSpace(proposal?.spaceId).then(() => rebuild({}));
	}, [client, proposal]);

	const selectChoice = useCallback(
		(choiceIndex: number) => {
			if (!proposal || 0 >= votingPower || hasVoted) return;
			setSelectedChoice(choiceIndex);
		},
		[hasVoted, proposal, votingPower]
	);

	const submitVote = useCallback(async () => {
		if (!proposal || selectedChoice == null) {
			return;
		}
		setLoading(true);
		try {
			await client.vote(proposal.spaceId, proposal.id, selectedChoice);
			setSelectedChoice(null);
			onVoteSubmitted();
		} catch (e) {
			console.error(e);
		}
		setLoading(false);
	}, [client, onVoteSubmitted, proposal, selectedChoice]);

	return (
		<Block loading={!proposal} title="Cast your vote" endTitle={hasVoted ? "✔️ Voted" : votingPower.toFixed(0)}>
			{proposal && (
				<>
					<div className="mb-4 md:mb-6 space-y-4 md:space-y-6">
						{proposal.choices.length &&
							proposal.choices.map((choice, i) => (
								<div key={i}>
									<div
										className={
											'flex w-full items-center justify-between overflow-hidden border h-12 border-skin-alt bg-transparent rounded-full duration-200 px-5 text-lg cursor-pointer' +
											((selectedChoice === i && ' !border-skin-text-muted') || '')
										}
										onClick={() => selectChoice(i)}
									>
										<div className="truncate w-full text-center">{choice}</div>
									</div>
								</div>
							))}
					</div>
					<PrimaryButton disabled={loading || !inSpace || hasVoted || votingPower <= 0 || selectedChoice === null} className="mx-auto" onClick={submitVote}>
						{loading ? (
							<>
								<Loader className="h-6 w-6" /> Loading...
							</>
						) : (
							'Vote'
						)}
					</PrimaryButton>
				</>
			)}
		</Block>
	);
};
