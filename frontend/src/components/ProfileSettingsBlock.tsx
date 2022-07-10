import { useState } from 'react';
// import { Space, Token } from '../client/types';
import { Block } from './Block';
import TextInput from './TextInput';

const InputLabel = ({ label }: { label: string }) => (
	<label className="mb-1 md:mb-1.5 text-lg block font-semibold">{label}</label>
);

export const ProfileSettingsBlock = () => {
	const [name, setName] = useState('');
	const [about, setAbout] = useState('');
	const [avatar, setAvatar] = useState('');
	const [website, setWebsite] = useState('');
	const [twitter, setTwitter] = useState('');
	const [github, setGithub] = useState('');
	const [discord, setDiscord] = useState('');

	// const token: Token = {
	// 	id: '',
	// 	name: '',
	// 	symbol: '',
	// };
	// const space: Space = {
	// 	id: -1,
	// 	isPrivate: false,
	// 	memberCount: 0,
	// 	name,
	// 	avatar,
	// 	token,
	// };

	return (
		<Block titleClassName="text-xl" title="Profile">
			<div className="mt-3 w-full space-y-4 md:space-y-8 sm:mt-0">
				<div className="">
					<InputLabel label="Avatar" />
					<TextInput
						onUserInput={setAvatar}
						value={avatar}
						placeholder="e.g. https://space.com/avatar.png"
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
					/>
				</div>

				{/* <ListboxMultipleCategories
							data-categories="categories"
							data-update-categories="value => emit('update:categories', value)"
						/> */}
				<div>
					<InputLabel label="Website" />
					<TextInput
						onUserInput={setWebsite}
						value={website}
						data-error="getErrorMessage('website')"
						maxLength={160}
						placeholder="e.g. https://www.example.com"
					/>
				</div>
				<div>
					<InputLabel label="Twitter" />
					<TextInput
						onUserInput={setTwitter}
						value={twitter}
						data-error="getErrorMessage('twitter')"
						maxLength={160}
						placeholder="e.g. https://twitter.com/vitasensus"
					/>
				</div>
				<div>
					<InputLabel label="Github" />
					<TextInput
						onUserInput={setGithub}
						value={github}
						data-error="getErrorMessage('github')"
						maxLength={160}
						placeholder="e.g. https://github.com/vitasensus"
					/>
				</div>
				<div>
					<InputLabel label="Discord" />
					<TextInput
						onUserInput={setDiscord}
						value={discord}
						data-error="getErrorMessage('discord')"
						maxLength={160}
						placeholder="e.g. https://discord.com/vitasensus"
					/>
				</div>

				{/* <InputUrl
							data-title="$t(`settings.terms.label`)"
							data-information="$t('settings.terms.information')"
							data-model-value="terms"
							data-error="getErrorMessage('terms')"
							placeholder="e.g. https://example.com/terms"
							data-update:model-value="value => emit('update:terms', value)"
						/> */}

				{/* <BaseSwitch
							className="!mt-3"
							data-model-value="private"
							data-text-right="$t('settings.hideSpace')"
							data-update:model-value="value => emit('update:private', value)"
						/> */}
			</div>
		</Block>
	);
};
