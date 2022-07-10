import { Proposal } from '../client/types';
import { Block } from './Block';

export const SpaceProposalResults = ({ proposal }: { proposal: Proposal }) => {
	return (
		<Block title="Results" slim>
			<div className="space-y-3">
				{proposal.choices.map((choice) => (
					<div className='flex items-center border-b border-skin-alt px-4 md:px-6 py-[14px]'>
						<div className="w-full mb-1 flex justify-between text-skin-link">
							<div className="flex overflow-hidden">
                                <span className='mr-1 truncate'>
                                    {choice}
                                </span>
                            </div>
                            <div className='flex justify-end space-x-2'>
                                <span className='whitespace-nowrap'>
                                    11.2k
                                    VITE
                                </span>
                                <span>11.2%</span>
                            </div>
						</div>
					</div>
				))}
			</div>
		</Block>
	);
};
