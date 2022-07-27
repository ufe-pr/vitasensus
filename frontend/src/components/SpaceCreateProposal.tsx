import { connect } from '../utils/globalContext';
import tw from 'tailwind-styled-components';
import { useCallback, useMemo, useState } from 'react';
import TextInput from './TextInput';
import { SpaceCreateProposalChoices } from './SpaceCreateProposalChoices';
import { SpaceCreateProposalTransactions } from './SpaceCreateProposalTransactions';
import { ChoiceAction } from '../client/types';
import { PrimaryButton } from './PrimaryButton';
import { useNavigate } from 'react-router-dom';
import { useClient } from '../hooks/client';
import { useCurrentSpace, useIsSpaceAdmin, useSpaceSettings, useUserInSpace } from '../hooks/space';

const InputLabel = tw.label`mb-1 md:mb-1.5 text-lg block font-semibold`;

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

export const SpaceCreateProposal = () => {
	const [title, setTitle] = useState('');
	const [description, setDescription] = useState('');
	const [choices, setChoices] = useState<Array<string>>([]);
	const [actions, setActions] = useState<Array<ChoiceAction>>([]);
	const [isLoading, setIsLoading] = useState(false);
	const [startDate, setStartDate] = useState<Date | undefined>();
	const [endDate, setEndDate] = useState(new Date(Date.now() + 86400 * 1000 * 3));
	const space = useCurrentSpace();
	const client = useClient();
	const settings = useSpaceSettings(space?.id);
	const inSpace = useUserInSpace(space?.id);
	const isSpaceAdmin = useIsSpaceAdmin(space?.id);
	const navigate = useNavigate();

	const createProposal = useCallback(
		async ({
			actions,
			choices,
			description,
			title,
			spaceId,
			startDate,
			endDate,
		}: {
			spaceId: number;
			title: string;
			description: string;
			choices: Array<string>;
			actions: Array<ChoiceAction>;
			startDate?: Date;
			endDate: Date;
		}) => {
			const proposal = await client.createProposal({
				choices,
				actions,
				description,
				title,
				spaceId: spaceId,
				end: Math.floor(endDate.valueOf() / 1000),
				start: !startDate ? 0 : Math.floor(startDate.valueOf() / 1000),
			});
			navigate('/space/' + spaceId + '/proposals/' + proposal.id, { replace: true });
		},
		[client, navigate]
	);

	const onSubmit = useCallback(async () => {
		setIsLoading(true);
		await createProposal({
			actions: actions.map((action) => {
				if (!action.executor) {
					return { ...action, executor: 'vite_0000000000000000000000000000000000000000a4f3a0cb58' };
				}
				return action;
			}),
			choices,
			description,
			title,
			spaceId: space!.id,
			startDate,
			endDate,
		}).finally(() => setIsLoading(false));
	}, [actions, choices, createProposal, description, endDate, space, startDate, title]);

	const formIsInvalid = useMemo(
		() => !title.trim() || !description.trim() || !choices.length || !actions.length,
		[actions.length, choices.length, description, title]
	);

	return !space ? (
		<></>
	) : (
		<form
			className="space-y-3 md:space-y-6"
			onSubmit={(e) => {
				e.preventDefault();
				if (formIsInvalid) return;
				onSubmit();
			}}
		>
			<h1>Create proposal </h1>
			<div className="space-y-4">
				<div>
					<InputLabel>Title</InputLabel>
					<TextInput required onUserInput={setTitle} value={title} maxLength={160} />
				</div>
				<div>
					<InputLabel>Description</InputLabel>
					<TextInput
						textarea
						resizable
						required
						onUserInput={setDescription}
						value={description}
						maxLength={1300}
					/>
				</div>
			</div>
			<SpaceCreateProposalChoices
				startDate={startDate}
				setStartDate={setStartDate}
				endDate={endDate}
				setEndDate={setEndDate}
				choices={choices}
				setChoices={setChoices}
			/>
			<SpaceCreateProposalTransactions
				choices={choices}
				batches={actions}
				setBatches={setActions}
			/>
			{!isSpaceAdmin && settings && settings !== '404' && settings.createProposalThreshold > 0 && (
				<div className="">
					<p>
						The amount of {settings.createProposalThreshold} {space.token.symbol} will be charged
						upon creating this proposal. It'll be instantly refunded though.
					</p>
				</div>
			)}
			<PrimaryButton disabled={isLoading || !settings || !inSpace || formIsInvalid}>
				{isLoading ? (
					<>
						<Loader className="h-6 w-6" /> Loading...
					</>
				) : (
					'Create proposal'
				)}
			</PrimaryButton>
			{!inSpace && !(settings && settings !== '404' && settings.onlyAdminsCanCreateProposal) && (
				<div className="text-red-400">
					<p>You're not a member of this space. You need to be a member to create a proposal.</p>
				</div>
			)}
			{!isSpaceAdmin && settings && settings !== '404' && settings.onlyAdminsCanCreateProposal && (
				<div className="text-red-400">
					<p>Only space admins can create proposals.</p>
				</div>
			)}
		</form>
	);
};

export default connect(SpaceCreateProposal);
