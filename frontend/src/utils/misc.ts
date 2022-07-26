import { TextInputRefObject } from '../components/TextInput';

export const isDarkMode = () => document.documentElement.classList.contains('dark');

export const prefersDarkTheme = () => window.matchMedia('(prefers-color-scheme: dark)').matches;

export const validateInputs = (
	inputRefs: React.MutableRefObject<TextInputRefObject | undefined>[]
) => {
	let allRefsInputsAreValid = true;
	for (const ref of inputRefs) {
		let isValid = ref.current!.isValid;
		// if (typeof isValid === 'object') {
		//   const issue = await isValid;
		//   if (issue) {
		//     allRefsInputsAreValid = false;
		//   }
		// }
		if (!isValid) {
			allRefsInputsAreValid = false;
		}
	}
	return allRefsInputsAreValid;
};

export const formatNumberCompact = (num: number | bigint) =>
	Intl.NumberFormat('en-US', { compactDisplay: 'short', notation: 'compact' }).format(num);

export const formatNumberPercentage = (num: number | bigint) =>
	Intl.NumberFormat('en-US', { style: 'percent', notation: 'compact' }).format(num);

export async function waitFor(
	conditionFn: () => Promise<boolean>,
	pollInterval: number = 1000,
	retries: number = 5
) {
	const poll = (resolve: any, reject: any) => {
		retries--;
		conditionFn()
			.then((result) => {
				if (result) {
					resolve();
				} else {
					retries
						? setTimeout(() => poll(resolve, reject), pollInterval)
						: reject('condition failed: timeout');
				}
			})
			.catch(() => {
				retries
					? setTimeout(() => poll(resolve, reject), pollInterval)
					: reject('condition failed: timeout');
			});
	};
	return new Promise(poll);
}
