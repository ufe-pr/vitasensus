import { useCurrentSpace, useSpaceSettings } from '../hooks/space';
import { connect } from '../utils/globalContext';
import { Block } from './Block';
import { PageLoader } from './Loader';
import { User } from './User';

const SpaceProfileDetails = () => {
	const space = useCurrentSpace();
	const settings = useSpaceSettings(space?.id);

	if (settings === null || space === null) {
		return <PageLoader></PageLoader>;
	}

	if (settings === '404') {
		return <div>Space settings couldn't be retrieved</div>;
	}

	return (
		<>
			<div className="w-full space-y-4 md:space-y-6 lg:space-y-8">
				<h2>Space details</h2>
				<Block titleClassName="text-xl" title="Token">
					<div className="mt-3 w-full space-y-4 md:space-y-8 sm:mt-0">
						<div>
							<span className="mr-2 md:mr-4">Token ID:</span>
							<span>{space?.token.id}</span>
						</div>
					</div>
				</Block>
				<Block titleClassName="text-xl" title="Space thresholds">
					<div className="mt-3 w-full space-y-4 md:space-y-8 sm:mt-0">
						<div>
							<span className="mr-2 md:mr-4">Create proposal threshold:</span>
							<span className="font-semibold">
								{settings.createProposalThreshold} {space.token.symbol}
							</span>
						</div>
						<div>
							<span className="mr-2 md:mr-4">Only admins can create proposals:</span>
							{settings.onlyAdminsCanCreateProposal ? (
								<span className="font-semibold">Yes</span>
							) : (
								<span className="font-semibold">No</span>
							)}
						</div>
					</div>
				</Block>

				<Block titleClassName="text-xl" title="Space Admins">
					<div className="mt-3 w-full space-y-4 md:space-y-8 sm:mt-0">
						<div className="">Owner</div>
						{space.owner && (
							<div className={'flex items-center border-b border-skin-alt px-3 py-0'}>
								<User fullLength address={space.owner} />
							</div>
						)}
						<div className="mt-2">Admins</div>
						{space.admins.map((vote, i) => (
							<div key={i} className={'flex items-center border-b border-skin-alt px-3 py-0'}>
								<User fullLength address={vote} />
							</div>
						))}
					</div>
				</Block>
			</div>
		</>
	);
};

export default connect(SpaceProfileDetails);
