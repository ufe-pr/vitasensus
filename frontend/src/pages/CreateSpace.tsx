import { Block } from '../components/Block';
import { PrimaryButton } from '../components/PrimaryButton';
import { ProfileSettingsBlock } from '../components/ProfileSettingsBlock';
import { connect } from '../utils/globalContext';

const CreateSpace = () => {
	return (
		<div className="flex flex-wrap lg:flex-nowrap">
			<div className="order-2 w-full lg:order-none lg:w-8/12 space-y-3 md:space-y-6">
				<h1>Create a space</h1>
				<ProfileSettingsBlock />
				<PrimaryButton>Create space</PrimaryButton>
			</div>
			<div className="w-full order-1 lg:order-none lg:w-4/12 mb-4 lg:mb-0">
				<Block className="text-skin-muted">
					<div className="leading-relaxed">
						Don't know how to create a space? Learn more in the{' '}
						<a target="_blank" rel="noreferrer" className="text-skin-primary" href="http://">
							documentation
						</a>{' '}
						or join our{' '}
						<a target="_blank" rel="noreferrer" className="text-skin-primary" href="http://">
							Discord
						</a>
					</div>
				</Block>
			</div>
		</div>
	);
};

export default connect(CreateSpace);
