import { ReactNode, useCallback, useRef } from 'react';

export const InputUploadAvatar = ({
	children,
	avatar,
	className,
}: {
	children?: ReactNode | ReactNode[];
	avatar?: string;
	className?: string;
	onUploaded: (url: string) => void;
}) => {
	const openFilePicker = useCallback(() => {}, []);
	const onFileChange = useCallback(() => {}, []);
	const fileRef = useRef(null);
	return (
		<div className={className}>
			<div onClick={avatar ? undefined : () => openFilePicker()}>
				{/* <BaseDropdown
                    data-items="[
                        { text: $t('profile.settings.change'), action: 'change' },
                        { text: $t('profile.settings.remove'), action: 'remove' }
                    ]"
                    data-on-select="handleSelect"
                >
                
                </BaseDropdown> */}
				<div className="button">{children}</div>
			</div>
			<input
				v-bind="$attrs"
				ref={fileRef}
				type="file"
				accept="image/jpg, image/jpeg, image/png"
				style={{ display: 'none' }}
				onChange={onFileChange}
			/>
		</div>
	);
};
