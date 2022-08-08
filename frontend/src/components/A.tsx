import React from 'react';
import { useNavigate } from 'react-router-dom';
import normalizeUrl from 'normalize-url';

type Props = React.HTMLProps<HTMLAnchorElement> & {
	to?: string;
};

const A = ({ to, href, children, className }: Props) => {
	const navigate = useNavigate();
	const parsedHref = href && normalizeUrl(href);
	return to ? (
		<button onClick={() => navigate(to)} className={className}>
			{children}
		</button>
	) : (
		<a href={parsedHref} target="_blank" rel="noopener noreferrer" className={className}>
			{children}
		</a>
	);
};

export default A;
