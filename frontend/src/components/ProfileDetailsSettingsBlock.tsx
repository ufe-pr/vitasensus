import { useEffect, useState } from 'react';
// import { Space, Token } from '../client/types';
import { Block } from './Block';
import { Loader } from './Loader';
import { PrimaryButton } from './PrimaryButton';
import TextInput from './TextInput';

const InputLabel = ({ label }: { label: string }) => (
	<label className="mb-1 md:mb-1.5 text-lg block font-semibold">{label}</label>
);

export const ProfileDetailsSettingsBlock = ({
	onSubmit,
	initialValues,
}: {
	initialValues?: {
		name: string;
		about: string;
		avatar: string;
		website: string;
		token: string;
	};
	onSubmit: (props: {
		name: string;
		about: string;
		avatar: string;
		website: string;
		token: string;
	}) => Promise<void>;
}) => {
	const [name, setName] = useState('');
	const [about, setAbout] = useState('');
	const [avatar, setAvatar] = useState('');
	const [website, setWebsite] = useState('');
	const [token, setToken] = useState('');
	const [loading, setLoading] = useState(false);

	useEffect(() => {
		if (initialValues?.name) {
			setName(initialValues.name);
			setAbout(initialValues.about);
			setAvatar(initialValues.avatar);
			setWebsite(initialValues.website);
			setToken(initialValues.token);
		}
	}, [
		initialValues?.name,
		initialValues?.about,
		initialValues?.avatar,
		initialValues?.website,
		initialValues?.token,
	]);

	return (
		<Block titleClassName="text-xl" title="Profile">
			<form
				className="mt-3 w-full space-y-4 md:space-y-8 sm:mt-0"
				onSubmit={(e) => {
					e.preventDefault();
					if (loading || !name.trim() || !about.trim() || !token.trim()) return;
					setLoading(true);
					onSubmit({
						name: name.trim(),
						about: about.trim(),
						avatar: avatar.trim(),
						website: website.trim(),
						token: token.trim(),
					})
						.then(() => {})
						.finally(() => setLoading(false));
				}}
			>
				<div className="">
					<InputLabel label="Avatar" />
					<TextInput
						onUserInput={setAvatar}
						value={avatar}
						placeholder="e.g. https://space.com/avatar.png"
						maxLength={32}
					/>
				</div>
				<div>
					<InputLabel label="Name" />
					<TextInput
						onUserInput={setName}
						value={name}
						data-error="getErrorMessage('name')"
						maxLength={20}
						placeholder="e.g. Vitasensus"
						required
					/>
				</div>
				<div>
					<InputLabel label="About" />
					<TextInput
						textarea
						onUserInput={(e) => setAbout(e)}
						value={about}
						maxLength={160}
						placeholder="Summary of space details"
						required
					/>
				</div>

				<div>
					<InputLabel label="Token ID" />
					<TextInput
						onUserInput={(e) => setToken(e)}
						value={token}
						maxLength={28}
						placeholder="e.g tti_000000000000000000000000"
						required
					/>
				</div>

				<div>
					<InputLabel label="Website" />
					<TextInput
						onUserInput={setWebsite}
						value={website}
						data-error="getErrorMessage('website')"
						maxLength={32}
						placeholder="e.g. https://www.example.com"
					/>
				</div>

				<div>
					{!initialValues && (
						<p className="text-orange-300 mb-2">
							100,000 VITE will be staked for 90 days to create a space. Do you wish to continue?
						</p>
					)}
					<PrimaryButton disabled={loading}>
						{loading ? (
							<>
								<Loader className="h-6 w-6" /> Loading...
							</>
						) : initialValues ? (
							'Update space'
						) : (
							'Create space'
						)}
					</PrimaryButton>
				</div>
			</form>
		</Block>
	);
};
