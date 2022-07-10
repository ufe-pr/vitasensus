import { useEffect, useState } from 'react';
import { Proposal, ProposalState } from '../client/types';
import { useClient } from './client';
// import { useSpace } from './space';

export function useProposal(spaceId: number, id: number): Proposal | null | '404' {
	const [proposal, setProposal] = useState<Proposal | null>(null);
	useEffect(() => {
		setProposal({
			author: 'vite_f32d7394da38392c4798428b37fcc5927507915cfee64a3c4a',
			choices: ['Choice 1', 'Choice 2'],
			description: `Tables are an essential part of any application. Manually creating and styling tables is no longer efficient as there is such a wide variety of ready-made libraries available for that purpose.

			These are five of the most popular React Table Libraries. We’ll be looking at the pros and cons of each and see some quick implementation examples.
			
			Make sure to publish and manage your customized tables in cloud component hubs like Bit (Github). It’ll save you time and make sure you don’t bore yourself to death by repeating yourself.`,
			end: 0,
			id: id,
			link: '',
			passActions: [],
			spaceId: spaceId,
			start: 0,
			title: 'Random title',
			state: ProposalState.active,
		});
	}, [id, spaceId]);

	return proposal;
}

export function useProposals(
	spaceId: number,
	count: number = 20
): { data?: Proposal[]; error?: object } {
	const client = useClient();
	const [proposals, setProposals] = useState<Proposal[]>();
	const [resultsEnd, setResultsEnd] = useState(false);
	const [error, setError] = useState<object>();

	useEffect(() => {
		if (resultsEnd) return;
		if ((proposals?.length ?? 0) >= count) return;

		client
			.getProposals(spaceId, { skip: proposals?.length! })
			.then((results) => {
				if (results.length === 0) {
					setResultsEnd(true);
				} else {
					setProposals([...(proposals ?? []), ...results]);
				}
			})
			.catch((e) => {
				setError(e);
			});
	}, [proposals, setProposals, count, resultsEnd, client, spaceId]);
	return {
		data: proposals,
		error: error,
	};
}
