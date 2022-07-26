import { useCallback, useEffect, useMemo, useState } from 'react';
import { Proposal } from '../client/types';
import { Block } from './Block';
import tw from 'tailwind-styled-components';
import { PrimaryButton } from './PrimaryButton';
import { useClient } from '../hooks/client';
import { Loader } from './Loader';
import { useUserInSpace } from '../hooks/space';

const ChoiceButton = tw.button<{}>`
	bg-transparent
	w-10
	h-12
	border-x
	border-x-skin-alt
	disabled:text-skin-alt
`;

export const SpaceProposalVote = ({
	proposal,
	onVoteSubmitted,
}: {
	proposal?: Proposal;
	className?: string;
	onVoteSubmitted: () => void;
}) => {
	const [selectedChoices, setSelectedChoices] = useState<number[]>([]);
	const [loading, setLoading] = useState(false);
	const client = useClient();
	const inSpace = useUserInSpace(proposal?.spaceId);
	const [_, rebuild] = useState({});
	const totalVotes = useMemo(
		() => selectedChoices.reduce((acc, cur) => acc + cur, 0),
		[selectedChoices]
	);
	const votingPower = useMemo(() => {
		Object.keys(_);
		if (!proposal) return 0;
		const votingPower = client.getVotingPower(proposal?.spaceId);
		if (votingPower) {
			return votingPower;
		}
		return 0;
	}, [client, proposal, _]);

	useEffect(() => {
		if (proposal?.choices.length) {
			setSelectedChoices(new Array(proposal.choices.length).fill(0));
		}
	}, [proposal?.choices.length]);

	useEffect(() => {
		proposal && client.getSpace(proposal?.spaceId).then(() => rebuild({}));
	}, [client, proposal]);

	const addVote = useCallback(
		(choiceIndex: number) => {
			if (!proposal || totalVotes >= client.getVotingPower(proposal.spaceId)) return;
			setSelectedChoices([
				...selectedChoices.slice(0, choiceIndex),
				selectedChoices[choiceIndex] + 1,
				...selectedChoices.slice(choiceIndex + 1),
			]);
		},
		[client, proposal, selectedChoices, totalVotes]
	);

	const removeVote = useCallback(
		(choiceIndex: number) => {
			const oldCount = selectedChoices[choiceIndex];

			setSelectedChoices([
				...selectedChoices.slice(0, choiceIndex),
				oldCount > 0 ? Number(BigInt(oldCount) - BigInt(1)) : 0,
				...selectedChoices.slice(choiceIndex + 1),
			]);
		},
		[selectedChoices]
	);

	const setChoiceCount = useCallback(
		(choiceIndex: number, count: number) => {
			if (!proposal || totalVotes - selectedChoices[choiceIndex] + count > votingPower) return;
			setSelectedChoices([
				...selectedChoices.slice(0, choiceIndex),
				count > 0 ? count : 0,
				...selectedChoices.slice(choiceIndex + 1),
			]);
		},
		[proposal, selectedChoices, totalVotes, votingPower]
	);

	const submitVote = useCallback(async () => {
		if (!proposal) {
			return;
		}
		setLoading(true);
		try {
			await client.vote(proposal.spaceId, proposal.id, selectedChoices);
			setSelectedChoices(new Array(proposal.choices.length).fill(0));
			onVoteSubmitted();
		} catch (e) {
			console.error(e);
		}
		setLoading(false);
	}, [client, onVoteSubmitted, proposal, selectedChoices]);

	return (
		<Block
			loading={!proposal}
			title="Cast your vote"
			endTitle={!proposal ? '0' : client.getVotingPower(proposal.spaceId).toFixed(0)}
		>
			{proposal && (
				<>
					<div className="mb-4 md:mb-6 space-y-4 md:space-y-6">
						{selectedChoices.length &&
							proposal.choices.map((choice, i) => (
								<div key={i}>
									<div
										className={
											'flex w-full items-center justify-between overflow-hidden border h-12 border-skin-alt bg-transparent rounded-full duration-200 px-5 pr-0 text-lg' +
											((selectedChoices[i] > 0 && ' !border-skin-text-muted') || '')
										}
									>
										<div className="truncate pr-3 text-left">{choice}</div>
										<div className="flex items-center justify-end">
											<ChoiceButton disabled={!selectedChoices[i]} onClick={() => removeVote(i)}>
												-
											</ChoiceButton>
											<input
												value={selectedChoices[i].toString()}
												onChange={(e) => setChoiceCount(i, parseInt(e.target.value))}
												className="input text-center"
												style={{ width: '40px', height: '44px' }}
												placeholder="0"
												type="number"
												disabled={loading}
											/>

											<ChoiceButton disabled={totalVotes >= votingPower} onClick={() => addVote(i)}>
												+
											</ChoiceButton>
										</div>
									</div>
								</div>
							))}
					</div>
					<PrimaryButton disabled={loading || !inSpace} className="mx-auto" onClick={submitVote}>
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
