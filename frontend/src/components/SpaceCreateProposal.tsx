import { connect } from '../utils/globalContext';
import tw from 'tailwind-styled-components';
import { useState } from 'react';
import TextInput from './TextInput';
import { SpaceCreateProposalChoices } from './SpaceCreateProposalChoices';
import { SpaceCreateProposalTransactions } from './SpaceCreateProposalTransactions';
import { useProposal } from '../hooks/proposal';
import { Proposal } from '../client/types';

const InputLabel = tw.label`mb-1 md:mb-1.5 text-lg block font-semibold`;

export const SpaceCreateProposal = () => {
	const [title, setTitle] = useState('');
	const [description, setDescription] = useState('');
	const proposal = useProposal(0, 1);
    if (!proposal) {
        return null;
    }
	return (
		<div className="space-y-3 md:space-y-6">
			<h1>Create proposal </h1>
			<div className="space-y-4">
				<div>
					<InputLabel>Title</InputLabel>
					<TextInput onUserInput={setTitle} value={title} maxLength={160} />
				</div>
				<div>
					<InputLabel>Description</InputLabel>
					<TextInput
						textarea
						resizable
						onUserInput={setDescription}
						value={description}
						maxLength={14000}
					/>
				</div>
			</div>
			<SpaceCreateProposalChoices />
			<SpaceCreateProposalTransactions proposal={proposal as Proposal} />
		</div>
	);
};

export default connect(SpaceCreateProposal);
