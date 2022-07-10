import { useState, useCallback } from 'react';
import { Space } from '../client/types';
import { useJoinSpace, useAddressInSpace } from '../hooks/space';
import { connect } from '../utils/globalContext';

const JoinButton = ({ space }: { space: Space }) => {
	const [loading, setLoading] = useState(false);
	const joinSpace = useJoinSpace();
	const joined = useAddressInSpace('', space.name);
	const handleClick = useCallback(async () => {
		setLoading(true);
		try {
			await joinSpace(space.id);
		} catch {
			// TODO: Show error modal when function fails or do error handling outside
		}
		setLoading(false);
	}, [joinSpace, space]);
	return (
		<button
			onClick={
				joined || loading
					? undefined
					: (e) => {
							e.preventDefault();
							handleClick();
					  }
			}
			className={
				'px-8 py-2 rounded-full border-2 border-gray-400 duration-200' +
				(joined ? ' border-opacity-50' : ' hover:bg-white/70 hover:text-black/80')
			}
		>
			{loading ? '...' : joined ? 'Joined' : 'Join'}
		</button>
	);
};

export default connect(JoinButton);
