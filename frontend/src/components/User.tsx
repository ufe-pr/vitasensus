import { shortenAddress } from '../utils/strings';

export function User({ address }: { address: string }) {
	return (
		<a href={'https://vitescan.io/address/' + address} rel="noreferrer" target="_blank" className='underline text-skin-primary'>
			{shortenAddress(address)}
		</a>
	);
}
