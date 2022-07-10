import { Link } from 'react-router-dom';

export const SpaceProposalDiscussionLink = ({ link }: { link?: string; className?: string }) => {
	return !link ? (
		<></>
	) : (
		<div>
			<Link to={link}>{link}</Link>
		</div>
	);
};
