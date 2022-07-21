import type { NavLinkProps } from 'react-router-dom';
import { NavLink } from 'react-router-dom';
import { Space } from '../client/types';
import { connect } from '../utils/globalContext';
import { formatNumberCompact } from '../utils/misc';
import JoinButton from './JoinButton';
import SpaceAvatar from './SpaceAvatar';

const SidebarLink = (props: NavLinkProps) => {
	return (
		<NavLink
			end
			className={({ isActive }) =>
				'block px-4 py-2 hover:bg-skin-base' +
				(isActive ? ' border-l-[3px] border-skin-text-muted !pl-[21px]' : '')
			}
			{...props}
		/>
	);
};

const SpaceSidebar = ({ space }: { space: Space }) => {
	return (
		<div className="w-full md:w-60 leading-5 sm:leading-6 shrink-0">
			<div className="border-y border-skin-alt bg-skin-base text-base md:rounded-xl md:border py-4">
				<div className="fy gap-y-2 text-center py-4">
					{space && <SpaceAvatar space={space} size={80} />}
					<h3 className="mx-3 mb-0.5 xy">
						<div className="mr-1 truncate">{space.name}</div>
					</h3>
					<div className="mb-[12px] text-skin-text">
						{formatNumberCompact(space.memberCount)} members
					</div>
					<JoinButton space={space} />
				</div>
				<div className="py-4">
					<SidebarLink to={'/space/' + space.id}>Proposals</SidebarLink>
					<SidebarLink to={'/space/' + space.id + '/create'}>Create proposal</SidebarLink>
				</div>
			</div>
		</div>
	);
};

export default connect(SpaceSidebar);
