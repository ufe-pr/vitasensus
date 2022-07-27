import { LoginIcon, LogoutIcon } from '@heroicons/react/outline';
import { ReactNode, useEffect, useState } from 'react';
import DropdownButton from '../components/DropdownButton';
import Modal from '../components/Modal';
import QR from '../components/QR';
import { connect } from '../utils/globalContext';
import { shortenAddress } from '../utils/strings';
import { State } from '../utils/types';
import { initViteConnect } from '../utils/viteConnect';

type Props = State & {
	children: ReactNode;
	className?: string;
};

const ViteConnectButton = ({ setState, i18n, vcInstance }: Props) => {
	const [connectURI, connectURISet] = useState('');

	useEffect(() => {
		if (vcInstance) {
			vcInstance.on('disconnect', () => setState({ vcInstance: null }));
		}
	}, [setState, vcInstance]);

	return vcInstance ? (
		<DropdownButton
			buttonJsx={<p>{shortenAddress(vcInstance.accounts[0])}</p>}
			dropdownJsx={
				<div className="fx px-2 py-0.5 h-7 gap-2">
					<LogoutIcon className="h-full text-skin-muted" />
					<button
						className="font-semibold"
						onClick={() => vcInstance!.killSession()}
						onMouseDown={(e) => e.preventDefault()}
					>
						{i18n.logOut}
					</button>
				</div>
			}
		/>
	) : (
		<>
			<button
				className="px-4 py-3 rounded-full border-2 border-skin-alt hover:border-skin-text-secondary duration-300"
				onClick={async () => {
					vcInstance = initViteConnect();
					connectURISet(await vcInstance.createSession());
					vcInstance.on('connect', () => {
						connectURISet('');
						setState({ vcInstance });
					});
				}}
			>
				<span className="md:hidden">
					<LoginIcon className="h-5 mirr" />
				</span>
				<p className="hidden md:inline-block">{i18n.connectWallet}</p>
			</button>
			{!!connectURI && (
				<Modal onClose={() => connectURISet('')}>
					<p className="text-center text-lg mb-3 font-semibold">{i18n.scanWithYourViteWalletApp}</p>
					<div className="xy">
						<QR data={connectURI} />
					</div>
				</Modal>
			)}
		</>
	);
};

export default connect(ViteConnectButton);
