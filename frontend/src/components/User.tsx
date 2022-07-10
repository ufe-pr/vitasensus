import { shortenAddress } from '../utils/strings';

export function User({ address }: { address: string }) {
	return <a href={'https://vitescan.io/address/' + address} target="_blank">{shortenAddress(address)}</a>;
}
