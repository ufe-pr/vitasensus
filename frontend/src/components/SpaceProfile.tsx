import { useCallback } from 'react';
import { ProfileDetailsSettingsBlock } from '../components/ProfileDetailsSettingsBlock';
import { useClient } from '../hooks/client';
import { useCurrentSpace, useSpaceSettings } from '../hooks/space';
import { connect } from '../utils/globalContext';
import { SpaceAdminSettingsBlock } from './SpaceAdminSettingsBlock';
import { SpaceThresholdSettingsBlock } from './SpaceThresholdSettingsBlock';

const SpaceProfile = () => {
	const client = useClient();
	const space = useCurrentSpace();
	const settings = useSpaceSettings(space?.id);
	const updateSpace = useCallback(
		async ({
			name,
			about,
			avatar,
			website,
			token,
		}: {
			name: string;
			about: string;
			avatar: string;
			website: string;
			token: string;
		}) => {
			if (!space) return;
			await client.updateSpace(space?.id, name, about, token, avatar, website);
			window.location.reload();
		},
		[client, space]
	);

	const updateThreshold = useCallback(
		async ({
			createProposalThreshold,
			onlyAdminCreateProposal,
		}: {
			createProposalThreshold: number;
			onlyAdminCreateProposal: boolean;
		}) => {
			if (!space) return;
			await client.updateSpaceProposalThreshold(
				space?.id,
				createProposalThreshold,
				onlyAdminCreateProposal
			);
			window.location.reload();
		},
		[client, space]
	);

	const updateAdmins = useCallback(
		async ({ admins }: { admins: string[] }) => {
			if (!space) return;
			await client.updateSpaceAdmins(space?.id, admins);
			window.location.reload();
		},
		[client, space]
	);
	return (
		<>
			<div className="w-full space-y-4 md:space-y-6 lg:space-y-8">
				<h2>Space details</h2>
				<ProfileDetailsSettingsBlock
					onSubmit={updateSpace}
					initialValues={
						space
							? {
									name: space.name,
									about: space.description ?? '',
									avatar: space.avatar ?? '',
									website: space.website ?? '',
									token: space.token.id,
							  }
							: undefined
					}
				/>
				{settings && settings !== '404' && (
					<SpaceThresholdSettingsBlock
						onSubmit={updateThreshold}
						initialValues={{
							threshold: settings.createProposalThreshold,
							onlyAdmins: settings.onlyAdminsCanCreateProposal,
						}}
					/>
				)}
				{space && (
					<SpaceAdminSettingsBlock
						onSubmit={updateAdmins}
						initialValues={{
							admins: space.admins,
						}}
					/>
				)}
			</div>
		</>
	);
};

export default connect(SpaceProfile);
