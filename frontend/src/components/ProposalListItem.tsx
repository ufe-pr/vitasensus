import { Link } from 'react-router-dom';
import { Proposal, Space } from '../client/types';
import { shortenString } from '../utils/strings';
import { Block } from './Block';
import { ProposalStateLabel } from './ProposalStateLabel';
import SpaceAvatar from './SpaceAvatar';
import { User } from './User';

export function ProposalListItem({ proposal, space }: { proposal: Proposal; space: Space }) {
	return (
		<Link to={'/space/' + space.id + '/proposals/' + proposal.id} className="block">
			<Block className="hover:border-skin-text duration-200">
				<div>
					<div className="mb-2 flex items-center justify-between">
						<div className="flex items-center space-x-1">
							<div className="h-10 w-10">
								<SpaceAvatar space={space} />
							</div>
							<span className="!ml-2 hidden md:block font-bold">{space.name}</span>
							<span>by</span>
							<User address={proposal.author} />
						</div>
						<ProposalStateLabel state={proposal.state} />
					</div>
					<h3 className="my-1 break-words leading-7">{proposal.title}</h3>
					<p className="mb-2 break-words sm:text-md leading-loose">
						{shortenString(proposal.description, 140, 0)}
					</p>
				</div>
			</Block>
		</Link>
	);
}
