import { useEffect, useState } from 'react';
import { Block } from './Block';
import { Loader } from './Loader';
import { PrimaryButton } from './PrimaryButton';
import InputSwitch from 'react-switch';
import tw from 'tailwind-styled-components';

const ChoiceButton = tw.button<{}>`
	bg-transparent
	w-10
	h-12
	border-x
	border-x-skin-alt
	disabled:text-skin-alt
`;

const InputLabel = ({ label, htmlFor }: { label: string; htmlFor?: string }) => (
	<label htmlFor={htmlFor} className="mb-1 md:mb-1.5 text-lg block font-semibold">
		{label}
	</label>
);

export const SpaceThresholdSettingsBlock = ({
	onSubmit,
	initialValues,
}: {
	initialValues?: {
		threshold: number;
		onlyAdmins: boolean;
	};
	onSubmit: (props: {
		createProposalThreshold: number;
		onlyAdminCreateProposal: boolean;
	}) => Promise<void>;
}) => {
	const [threshold, setThreshold] = useState(0);
	const [onlyAdmin, setOnlyAdmin] = useState(false);
	const [loading, setLoading] = useState(false);

	useEffect(() => {
		if (initialValues?.threshold !== undefined) {
			setThreshold(initialValues.threshold);
			setOnlyAdmin(initialValues.onlyAdmins);
		}
	}, [initialValues?.onlyAdmins, initialValues?.threshold]);

	return (
		<Block titleClassName="text-xl" title="Space Threshold">
			<form
				className="mt-3 w-full space-y-4 md:space-y-8 sm:mt-0"
				onSubmit={(e) => {
					

					e.preventDefault();
					if (loading) return;
					setLoading(true);
					onSubmit({
						createProposalThreshold: threshold,
						onlyAdminCreateProposal: onlyAdmin,
					})
						.then(() => {})
						.finally(() => setLoading(false));
				}}
			>
				<div className="flex justify-between">
					<InputLabel label="Create proposal threshold" />
					<div className="flex items-center justify-end">
						<ChoiceButton
							disabled={loading || !threshold}
							onClick={() => threshold && setThreshold(threshold - 1)}
							type="button"
						>
							-
						</ChoiceButton>
						<input
							value={threshold}
							onChange={(e) => setThreshold(parseInt(e.target.value))}
							className="input text-center"
							style={{ width: '40px', height: '44px' }}
							placeholder="0"
							type="number"
							disabled={loading}
						/>

						<ChoiceButton
							disabled={loading}
							onClick={() => setThreshold(threshold + 1)}
							type="button"
						>
							+
						</ChoiceButton>
					</div>
				</div>
				<div className="flex justify-between">
					<InputLabel htmlFor="onlyAdminSwitch" label="Only allow admin create proposal" />
					<InputSwitch
						id="onlyAdminSwitch"
						onChange={(value) => setOnlyAdmin(value)}
						checked={onlyAdmin}
					/>
				</div>

				<PrimaryButton disabled={loading}>
					{loading ? (
						<>
							<Loader className="h-6 w-6" /> Loading...
						</>
					) : (
						'Update'
					)}
				</PrimaryButton>
			</form>
		</Block>
	);
};
