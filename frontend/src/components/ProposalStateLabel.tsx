import { ProposalState } from '../client/types';

export function ProposalStateLabel({ state }: { state: ProposalState }) {
	let bgClass;
	switch (state) {
		case ProposalState.active:
			bgClass = 'bg-green-600 dark:bg-green-700';
			break;
		case ProposalState.closed:
			bgClass = 'bg-violet-600';
			break;
		default:
			bgClass = 'bg-gray-500';
	}
	return (
		<span className={'rounded-full text-white px-3 py-2 leading-none ' + bgClass}>{state}</span>
	);
}
