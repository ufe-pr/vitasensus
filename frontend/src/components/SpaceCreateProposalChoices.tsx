import { CalendarIcon, PlusIcon } from '@heroicons/react/outline';
import { useCallback, useState } from 'react';
import { Block } from './Block';

import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';

export const SpaceCreateProposalChoices = () => {
	const [choices, setChoices] = useState(['And', 'Or', 'Not']);
	const [startDate, setStartDate] = useState<Date | undefined>();
	const [endDate, setEndDate] = useState(new Date(Date.now() + 86400 * 1000 * 3));

	const updateChoice = useCallback(
		(index: number, choice: string) => {
			setChoices([...choices.slice(0, index), choice, ...choices.slice(index + 1)]);
		},
		[choices]
	);

	const addChoice = useCallback(() => {
		setChoices([...choices, '']);
	}, [choices]);

	return (
		<div className="space-y-3 md:space-y-6">
			<Block title="Choices">
				<div className="flex gap-x-3">
					<div className="flex-1 space-y-3 md:space-y-6">
						{choices.map((choice, index) => (
							<div
								key={index}
								className="rounded-full border border-skin-alt focus-within:border-skin-text space-x-3 flex"
							>
								<label className="h-full p-3 !pr-0 md:p-4 border-r-0 basis-auto shrink-0 border-skin-alt text-skin-muted">
									Choice {index + 1}
								</label>
								<input
									className="peer outline-none border-none h-full p-3 md:p-4 !pl-0 min-w-0 grow"
									type="text"
									value={choice}
									onChange={(e) => updateChoice(index, e.target.value)}
								/>
							</div>
						))}
					</div>
					<div className="h-11 w-11 xy self-end">
						<button
							onClick={addChoice}
							className=" h-full w-full xy rounded-full border dark:border-skin-foreground border-skin-text-muted hover:border-skin-text overflow-hidden duration-200 "
						>
							<PlusIcon className="h-5" />
						</button>
					</div>
				</div>
			</Block>
			<Block title="Voting period">
				<div className="flex w-full flex-wrap lg:flex-nowrap gap-2 md:gap-3">
					<div className="rounded-full border border-skin-alt focus-within:border-skin-text space-x-3 fx w-full  lg:w-1/2 overflow-hidden">
						<label className="h-full p-2 px-3 !pr-0 md:p-3 md:px-4 border-r-0 border-skin-alt text-skin-muted">
							Start
						</label>
						<DatePicker
							wrapperClassName="peer outline-none border-none h-full p-2 md:p-3 !pl-0 !inline-flex flex-1 fx"
							className="fx inline-block"
							minDate={new Date()}
							selected={startDate}
							onChange={(date) => (date ? setStartDate(date) : setStartDate(undefined))}
							value={startDate ? undefined : 'Now'}
							showTimeSelect
							timeFormat="HH:mm"
							timeIntervals={15}
							timeCaption="time"
							dateFormat="MMMM d, yyyy h:mm aa"
						/>
						<span className="h-5 w-8 pr-3">
							<CalendarIcon className="text-lg" fontSize={20} />
						</span>
					</div>
					<div className="rounded-full border border-skin-alt focus-within:border-skin-text space-x-3 flex fx w-full lg:w-1/2">
						<label className="h-full p-2 px-3 !pr-0 md:p-3 md:px-4 border-r-0 border-skin-alt text-skin-muted">
							End
						</label>
						<DatePicker
							wrapperClassName="peer outline-none border-none h-full p-2 md:p-3 !pl-0 !inline-flex flex-1 fx"
							minDate={startDate}
							selected={endDate}
							onChange={(date) => date && setEndDate(date)}
							showTimeSelect
							timeFormat="HH:mm"
							timeIntervals={15}
							timeCaption="time"
							dateFormat="MMMM d, yyyy h:mm aa"
						/>
						<span className="h-5 w-8 pr-3">
							<CalendarIcon className="text-lg" fontSize={20} />
						</span>
					</div>
				</div>
			</Block>
		</div>
	);
};
