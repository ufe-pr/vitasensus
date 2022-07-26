import { useEffect, useState } from 'react';
import { Block } from './Block';
import { Loader } from './Loader';
import { PrimaryButton } from './PrimaryButton';
import TextInput from './TextInput';

const InputLabel = ({ label, htmlFor }: { label: string; htmlFor?: string }) => (
	<label htmlFor={htmlFor} className="mb-1 md:mb-1.5 text-lg block font-semibold">
		{label}
	</label>
);

export const SpaceAdminSettingsBlock = ({
	onSubmit,
	initialValues,
}: {
	initialValues?: {
		admins: string[];
	};
	onSubmit: (props: { admins: string[] }) => Promise<void>;
}) => {
	const [admins, setAdmins] = useState('');
	const [loading, setLoading] = useState(false);

	useEffect(() => {
		if (initialValues?.admins !== undefined) {
			setAdmins(initialValues.admins.join('\n'));
		}
	}, [initialValues?.admins]);

	return (
		<Block titleClassName="text-xl" title="Space Admins">
			<form
				className="mt-3 w-full space-y-4 md:space-y-8 sm:mt-0"
				onSubmit={(e) => {
					

					e.preventDefault();
					if (loading) return;
					setLoading(true);
					onSubmit({
						admins: admins.split('\n').filter((a) => a.length > 0),
					})
						.then(() => {})
						.finally(() => setLoading(false));
				}}
			>
				<div className="">
					<InputLabel label="Admins" />
					<TextInput
						value={admins}
						onUserInput={(e) => setAdmins(e)}
						textarea
						inputClassName='min-h-[10rem]'
					/>
				</div>

				<PrimaryButton disabled={loading}>
					{loading ? (
						<>
							<Loader className="h-6 w-6" /> Loading...
						</>
					) : (
						'Save'
					)}
				</PrimaryButton>
			</form>
		</Block>
	);
};
