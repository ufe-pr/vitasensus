import { ExternalLinkIcon } from '@heroicons/react/outline';
import type { NavLinkProps } from 'react-router-dom';
import { NavLink } from 'react-router-dom';
import { DetailedSpace } from '../client/types';
import { useIsSpaceAdmin } from '../hooks/space';
import { formatNumberCompact } from '../utils/misc';
import A from './A';
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

const SpaceSidebar = ({ space }: { space: DetailedSpace }) => {
	const isAdmin = useIsSpaceAdmin(space.id);
	return (
		<div className="w-full md:w-60 leading-5 sm:leading-6 shrink-0">
			<div className="border-y border-skin-alt bg-skin-base text-base md:rounded-xl md:border py-4">
				<div className="fy gap-y-2 text-center py-4">
					<SpaceAvatar space={space} size={80} />
					<h3 className="mx-3 mb-0.5 xy">
						<div className="mr-1 truncate">{space.name}</div>
					</h3>
					{space.website?.trim() && (
						<A href={space.website.trim()} className="underline">
							website
							<ExternalLinkIcon className="h-4 ml-1 inline text-skin-muted" />
						</A>
					)}
					<div className="">
						<span className="text-skin-muted text-sm">Token: </span>
						<A href={'https://vitescan.io/token/' + space.token.id} className="hover:underline">
							{space.token.symbol}
						</A>
					</div>
					<div className="mb-[12px] text-skin-text">
						{formatNumberCompact(space.memberCount)} member{space.memberCount !== 1 && 's'}
					</div>
					<JoinButton space={space} />
				</div>
				<div className="py-4">
					<SidebarLink to={'/space/' + space.id}>Proposals</SidebarLink>
					<SidebarLink to={'/space/' + space.id + '/create'}>Create proposal</SidebarLink>
					<SidebarLink to={'/space/' + space.id + '/about'}>About</SidebarLink>
					{isAdmin && <SidebarLink to={'/space/' + space.id + '/edit'}>Edit space</SidebarLink>}
				</div>
			</div>
		</div>
	);
};

export default SpaceSidebar;
