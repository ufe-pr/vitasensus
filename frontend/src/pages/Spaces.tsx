import { RefreshIcon, ArrowSmDownIcon, ChevronDownIcon } from '@heroicons/react/outline';
import { useCallback, useEffect, useState } from 'react';
import { Space } from '../client/types';
import DropdownButton from '../components/DropdownButton';
import SpacesList from '../components/SpacesList';
import TextInput from '../components/TextInput';
import { connect } from '../utils/globalContext';
import { useTitle } from '../utils/hooks';
import { shortenAddress } from '../utils/strings';
import { CoffeeBuyEvent, State } from '../utils/types';
import { getPastEvents } from '../utils/viteScripts';

type Props = State & {};

const Spaces = ({}: Props) => {
	const [search, setSearch] = useState('');
	return (
		<>
			<div className="flex flex-wrap lg:flex-nowrap items-center gap-x-5 gap-y-2 mb-4 md:mb-6 lg:mb-8">
				<TextInput
					label="Search"
					value={search}
					onUserInput={setSearch}
					containerClassName="w-full lg:w-auto grow "
				/>
				<DropdownButton
					containerClassName="w-full lg:w-auto"
					className="inline-block w-full h-auto px-4 py-2 border-2 border-skin-text-secondary rounded-full"
					dropdownJsx={<div></div>}
					buttonJsx={
						<>
							<span className="text-skin-secondary">Sort by:</span> Name Asc.
							<ChevronDownIcon className="inline-block ml-1" height={24} />
						</>
					}
				/>
				<DropdownButton
					containerClassName="w-full lg:w-auto"
					className="inline-block w-full h-auto px-4 py-2 border-2 border-skin-text-secondary rounded-full"
					dropdownJsx={<div></div>}
					buttonJsx={
						<>
							<span className="text-skin-secondary">Status:</span> Joined
							<ChevronDownIcon className="inline-block ml-1" height={24} />
						</>
					}
				/>
			</div>
			<SpacesList />
		</>
	);
};

export default connect(Spaces);
