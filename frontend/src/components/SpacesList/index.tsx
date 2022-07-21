import { Link } from 'react-router-dom';
import { Space } from '../../client/types';
import { useSpaces } from '../../hooks/space';
import { formatNumberCompact } from '../../utils/misc';
import JoinButton from '../JoinButton';
import SpaceAvatar from '../SpaceAvatar';

type Props = {
	className?: string;
};

const SpaceComponent = ({ space }: { space: Space }) => {
	return (
		<Link to={'/space/' + space.id}>
			<div
				className="px-6 py-6 rounded-3xl flex flex-col gap-y-6 items-center border-2 border-gray-400/20"
				key={space.id}
			>
				{space && <SpaceAvatar space={space} size={80} />}
				<h2 className="font-semibold text-lg">{space.name}</h2>
				<div>{(space.memberCount && formatNumberCompact(space.memberCount)) ?? '-'} members</div>
				<JoinButton space={space} />
			</div>
		</Link>
	);
};

const SpacesList = ({ className }: Props) => {
	const { data: spaces } = useSpaces(20);
	return (
		<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 justify-center mx-auto">
			{spaces && spaces.map((space) => <SpaceComponent key={space.id} space={space} />)}
		</div>
	);
};

export default SpacesList;
