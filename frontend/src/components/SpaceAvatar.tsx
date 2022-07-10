import { Space } from '../client/types';

const SpaceAvatar = ({ space, size }: { space: Space; size?: number | string }) => (
	<div
		style={{ height: size, width: size }}
		className="h-20 w-20 max-w-full max-h-full rounded-full bg-gray-400 bg-opacity-20"
	>
		{space.avatar && (
			<img className="object-cover h-full w-full" src={space.avatar} alt={`${space.name} logo`} />
		)}
	</div>
);
export default SpaceAvatar;
