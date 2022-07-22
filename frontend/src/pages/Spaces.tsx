import { useState } from 'react';
import SpacesList from '../components/SpacesList';
import TextInput from '../components/TextInput';
import { connect } from '../utils/globalContext';

const Spaces = () => {
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
			</div>
			<SpacesList query={search} />
		</>
	);
};

export default connect(Spaces);
