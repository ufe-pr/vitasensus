import { shortenAddress } from '../utils/strings';

export function User({ address, fullLength }: { address: string; fullLength?: boolean }) {
	return (
		<a href={'https://vitescan.io/address/' + address} rel="noreferrer" target="_blank" className='underline text-skin-primary'>
			{fullLength ? address : shortenAddress(address)}
		</a>
	);
}
