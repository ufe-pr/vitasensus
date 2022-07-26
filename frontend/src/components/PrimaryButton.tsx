import tw from 'tailwind-styled-components';

export const PrimaryButton = tw.button`
	bg-skin-highlight disabled:opacity-10 hover:disabled:bg-skin-highlight
	duration-300
	hover:bg-skin-lowlight active:bg-skin-lowlight focus-visible:bg-skin-lowlight focus-within:bg-skin-lowlight focus:bg-skin-lowlight
	py-2 px-4 min-h-[3rem]
	min-w-[8rem]
	w-full
	rounded-full
	block
`;
