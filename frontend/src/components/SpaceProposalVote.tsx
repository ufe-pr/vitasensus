import { useCallback, useEffect, useState } from 'react';
import { Proposal } from '../client/types';
import { Block } from './Block';
import tw from 'tailwind-styled-components';
import { PrimaryButton } from './PrimaryButton';

const ChoiceButton = tw.button<{}>`
	bg-transparent
	w-10
	h-12
	border-x
	border-x-skin-alt
	disabled:text-skin-alt
`;

export const SpaceProposalVote = ({ proposal }: { proposal?: Proposal; className?: string }) => {
	const [selectedChoices, setSelectedChoices] = useState<number[]>([]);
	useEffect(() => {
		if (proposal?.choices.length) {
			setSelectedChoices(new Array(proposal.choices.length).fill(0));
		}
	}, [proposal?.choices.length]);

	const addVote = useCallback(
		(choiceIndex: number) => {
			setSelectedChoices([
				...selectedChoices.slice(0, choiceIndex),
				selectedChoices[choiceIndex] + 1,
				...selectedChoices.slice(choiceIndex + 1),
			]);
		},
		[selectedChoices]
	);

	const removeVote = useCallback(
		(choiceIndex: number) => {
			const oldCount = selectedChoices[choiceIndex];
			setSelectedChoices([
				...selectedChoices.slice(0, choiceIndex),
				oldCount > 0 ? oldCount - 1 : 0,
				...selectedChoices.slice(choiceIndex + 1),
			]);
		},
		[selectedChoices]
	);

	const setChoiceCount = useCallback(
		(choiceIndex: number, count: number) => {
			setSelectedChoices([
				...selectedChoices.slice(0, choiceIndex),
				count > 0 ? count : 0,
				...selectedChoices.slice(choiceIndex + 1),
			]);
		},
		[selectedChoices]
	);

	return !proposal ? (
		<></>
	) : (
		<Block title='Cast your vote'>
			<div className="mb-4 md:mb-6 space-y-4 md:space-y-6">
				{proposal.choices.map((choice, i) => (
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
									value={selectedChoices[i] ?? 0}
									onChange={(e) => setChoiceCount(i, parseInt(e.target.value))}
									className="input text-center"
									style={{ width: '40px', height: '44px' }}
									placeholder="0"
									type="number"
								/>

								<ChoiceButton onClick={() => addVote(i)}>+</ChoiceButton>
							</div>
						</div>
					</div>
				))}
			</div>
			<PrimaryButton className="mx-auto" onClick={() => alert('Voting not implemented yet')}>Vote</PrimaryButton>
		</Block>
	);
};
