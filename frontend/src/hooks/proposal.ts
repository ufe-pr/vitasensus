import { useEffect, useState } from 'react';
import { Proposal } from '../client/types';
import { useClient } from './client';
// import { useSpace } from './space';

export function useProposal(spaceId: number, id: number): Proposal | null | '404' {
	const [proposal, setProposal] = useState<Proposal | null>(null);
	const [proposalNotFound, setProposalNotFound] = useState<boolean>(false);
	const client = useClient();

	useEffect(() => {
		setProposal(null);
		setProposalNotFound(false);
	}, [client, id, spaceId]);

	useEffect(() => {
		client
			.getProposal(spaceId, id)
			.then(
				async (proposal) => {
					if (proposal) {
						return proposal;
					}
					return null;
				},
				(e) => {
					console.error(e);

					return null;
				}
			)
			.then((proposal) => {
				

				!proposal && setProposalNotFound(true);
				setProposal(proposal);
			});
	}, [client, id, spaceId]);

	return proposalNotFound ? '404' : proposal;
}

export function useProposals(
	spaceId?: number | null,
	count: number = 20
): { data?: Proposal[]; error?: object } {
	const client = useClient();
	const [proposals, setProposals] = useState<Proposal[]>();
	const [resultsEnd, setResultsEnd] = useState(false);
	const [error, setError] = useState<object>();

	useEffect(() => {
		setProposals([]);
		setResultsEnd(false);
		setError(undefined);
	}, [spaceId, client]);

	useEffect(() => {
		if (spaceId === undefined || spaceId === null) return;
		if (resultsEnd) return;
		if ((proposals?.length ?? 0) >= count) return;

		

		client
			.getProposals(spaceId, {
				skip: proposals?.length ?? 0,
				limit: count - (proposals?.length ?? 0),
			})
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
