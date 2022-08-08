import { ReactNode, useContext, useEffect, useMemo, useState } from 'react';
import {
	TranslateIcon,
	SunIcon,
	MoonIcon,
	DesktopComputerIcon,
	PlusIcon,
	DotsVerticalIcon,
} from '@heroicons/react/outline';
import A from '../components/A';
import { NetworkTypes, State } from '../utils/types';
import { prefersDarkTheme } from '../utils/misc';
import { connect, setStateType } from '../utils/globalContext';
import ViteConnectButton from './ViteConnectButton';
import ViteLogo from '../assets/ViteLogo';
import { PROD } from '../utils/constants';
import DropdownButton from '../components/DropdownButton';
import { Link } from 'react-router-dom';
import { SpacesContext } from '../utils/SpacesContext';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faGithub } from '@fortawesome/free-brands-svg-icons';
import normalizeUrl from 'normalize-url';

type Props = State & {
	noPadding?: boolean;
	children: ReactNode;
};

const PageContainer = ({
	noPadding,
	networkType,
	languageType,
	i18n,
	setState,
	children,
}: Props) => {
	useEffect(() => {
		import(`../i18n/${languageType}.ts`).then((translation) => {
			setState({ i18n: translation.default });
		});
	}, [setState, languageType]);

	const networkTypes = useMemo(() => {
		const arr: [NetworkTypes, string][] = [
			['mainnet', i18n?.mainnet],
			['testnet', i18n?.testnet],
		];
		!PROD && arr.push(['localnet', i18n?.localnet]);
		return arr;
	}, [i18n]);

	const languages = [
		['English', 'en'],
		// ['English', 'en'],
	];
	const [sidebarOpen, setSidebarOpen] = useState(false);

	return !i18n ? null : (
		<div className="flex w-screen overflow-x-hidden relative">
			<Sidebar isOpen={sidebarOpen} close={() => setSidebarOpen(false)} />
			<div className="w-screen md:w-auto h-0 min-h-screen grow shrink-0 relative flex flex-col overflow-y-auto">
				<header className="fx bg-skin-base border-b-2 border-y-skin-alt px-4 lg:px-8 h-24 justify-between top-0 w-full sticky shrink-0 z-50">
					<button className="md:hidden px-2" onClick={() => setSidebarOpen(!sidebarOpen)}>
						<DotsVerticalIcon className="h-5" />
					</button>
					<div className="fx gap-3">
						<A to="/" className="px-1 h-8 text-xl font-bold">
							Vitasensus
						</A>
					</div>
					<div className="fx gap-3 relative">
						<NetworkSelectionToggle {...{ i18n, networkType, networkTypes, setState }} />
						<ViteConnectButton />
						<LanguageToggleButton languages={languages} setState={setState} />
						<ThemeToggleButton i18n={i18n} />
					</div>
				</header>
				<main
					className={`flex-1 w-full max-w-5xl mx-auto ${noPadding ? '' : 'p-4 md:p-8 lg:p-16'}`}
				>
					{children}
				</main>
				<div className="fx justify-center gap-2 mx-4 my-3 text-skin-muted">
					<A href={process.env.REACT_APP_GITHUB_URL} className="brightness-button">
						<FontAwesomeIcon icon={faGithub} /> <span className="ml-2">Github</span>
					</A>
				</div>
			</div>
		</div>
	);
};

export default connect(PageContainer);

type SidebarItemProps = {
	avatar: string | ReactNode;
	label: string;
	href: string;
	isSelected?: boolean;
	className?: string;
};

function SidebarItem({ avatar, label, href, className }: SidebarItemProps) {
	return (
		<div className="h-11 w-full xy">
			<Link to={href}>
				<button
					className={
						(className || '') +
						' h-11 w-11 xy rounded-full border dark:border-skin-foreground border-skin-text-muted hover:border-skin-text overflow-hidden duration-200 '
					}
				>
					{typeof avatar === 'string' ? (
						<img
							className="h-full w-full object-cover"
							src={avatar && normalizeUrl(avatar)}
							alt={label}
						/>
					) : (
						avatar
					)}
				</button>
			</Link>
		</div>
	);
}

function Sidebar({ isOpen, close }: { isOpen?: boolean; close?: () => void }) {
	const { userSpaces } = useContext(SpacesContext);
	// const [_, rebuild] = useState({});

	return (
		<div
			className={
				(isOpen ? 'w-16' : 'w-0') +
				' md:w-20 h-screen grow-0 shrink-0 top-0 sticky border-r border-r-skin-alt py-8 overflow-hidden'
			}
			onClick={() => close?.()}
		>
			<ul className="flex flex-col gap-y-6">
				<li>
					<SidebarItem avatar={<ViteLogo />} label="Home" href="/" className="border-none" />
				</li>
				<li>
					<SidebarItem
						avatar={<PlusIcon className="h-5" />}
						label="Create Organization"
						href="/create"
					/>
				</li>
				<span className="w-4/5 h-0.5 bg-skin-alt mx-auto my-2"></span>
				{userSpaces.map((space) => (
					<li key={space.id}>
						<SidebarItem avatar={space.avatar} label={space.name} href={`/space/${space.id}`} />
					</li>
				))}
			</ul>
		</div>
	);
}

function NetworkSelectionToggle({
	i18n,
	networkType,
	networkTypes,
	setState,
}: {
	i18n: any;
	networkType: string;
	networkTypes: [NetworkTypes, string][];
	setState: setStateType;
}) {
	return (
		<DropdownButton
			buttonJsx={<p className="text-skin-secondary">{i18n[networkType]}</p>}
			dropdownJsx={
				<>
					{networkTypes.map(([networkType, label]) => {
						const active = (localStorage.networkType || 'testnet') === networkType;
						return (
							<button
								key={networkType}
								className={`fx font-semibold px-2 w-full h-7 bg-skin-foreground brightness-button ${
									active ? 'text-skin-highlight' : ''
								}`}
								onMouseDown={(e) => e.preventDefault()}
								onClick={() => {
									localStorage.networkType = networkType;
									setState({ networkType });
								}}
							>
								{label}
							</button>
						);
					})}
				</>
			}
		/>
	);
}

function LanguageToggleButton({
	languages,
	setState,
}: {
	languages: string[][];
	setState: setStateType;
}) {
	return (
		<DropdownButton
			buttonJsx={
				<div className="w-8 h-8 xy">
					<TranslateIcon className="text-skin-muted w-7 h-7" />
				</div>
			}
			dropdownJsx={
				<>
					{languages.map(([language, shorthand]) => {
						const active =
							localStorage.languageType === shorthand ||
							(!localStorage.languageType && shorthand === 'en');
						return (
							<button
								key={language}
								className={`fx px-2 w-full h-7 bg-skin-foreground brightness-button ${
									active ? 'text-skin-highlight' : ''
								}`}
								onMouseDown={(e) => e.preventDefault()}
								onClick={() => {
									localStorage.languageType = shorthand;
									setState({ languageType: shorthand });
								}}
							>
								{language}
							</button>
						);
					})}
				</>
			}
		/>
	);
}

function ThemeToggleButton({ i18n }: { i18n: any }) {
	const [theme, themeSet] = useState(localStorage.theme);
	const themes: [typeof SunIcon, string][] = [
		[SunIcon, i18n?.light],
		[MoonIcon, i18n?.dark],
		[DesktopComputerIcon, i18n?.system],
	];
	return (
		<DropdownButton
			buttonJsx={
				<div className="w-8 h-8 xy">
					<div
						className={`w-7 h-7 ${theme === 'system' ? 'text-skin-muted' : 'text-skin-highlight'}`}
					>
						<SunIcon className="block dark:hidden" />
						<MoonIcon className="hidden dark:block" />
					</div>
				</div>
			}
			dropdownJsx={
				<>
					{themes.map(([Icon, label]) => {
						const active = localStorage.theme === label;
						return (
							<button
								key={label}
								className="fx px-2 py-0.5 h-7 gap-2 w-full bg-skin-foreground brightness-button"
								onMouseDown={(e) => e.preventDefault()}
								onClick={() => {
									localStorage.theme = label;
									themeSet(label);
									if (label === 'light') {
										document.documentElement.classList.remove('dark');
									} else if (label === 'dark') {
										document.documentElement.classList.add('dark');
									} else if (!prefersDarkTheme()) {
										document.documentElement.classList.remove('dark');
									} else if (prefersDarkTheme()) {
										document.documentElement.classList.add('dark');
									}
								}}
							>
								<Icon
									className={`h-full ${active ? 'text-skin-highlight' : 'text-skin-secondary'}`}
								/>
								<p className={`font-semibold ${active ? 'text-skin-highlight' : ''}`}>
									{label[0].toUpperCase() + label.substring(1)}
								</p>
							</button>
						);
					})}
				</>
			}
		/>
	);
}
