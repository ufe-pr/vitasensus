import { useCallback, useEffect, useMemo, useState } from 'react';
import { Proposal } from '../client/types';
import { Block } from './Block';
import tw from 'tailwind-styled-components';
import { PrimaryButton } from './PrimaryButton';
import { useClient } from '../hooks/client';

const ChoiceButton = tw.button<{}>`
	bg-transparent
	w-10
	h-12
	border-x
	border-x-skin-alt
	disabled:text-skin-alt
`;

const Loader = ({ className }: { className?: string }) => {
	return (
		<svg
			role="status"
			className={(className ? className + ' ' : '') + 'inline mr-3 h-full text-white animate-spin'}
			viewBox="0 0 100 101"
			fill="none"
			xmlns="http://www.w3.org/2000/svg"
		>
			<path
				d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z"
				fill="#E5E7EB"
			/>
			<path
				d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z"
				fill="currentColor"
			/>
		</svg>
	);
};

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
						{selectedChoices.length && proposal.choices.map((choice, i) => (
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
					<PrimaryButton className="mx-auto" onClick={submitVote}>
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
