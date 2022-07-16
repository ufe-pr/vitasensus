import React, { ReactNode } from 'react';

export function Block({
	loading,
	slim,
	children,
	className,
	title,
	endTitle,
	titleClassName,
	endTitleClassName,
}: {
	loading?: boolean;
	slim?: boolean;
	children: ReactNode | ReactNode[];
	className?: string;
	title?: string;
	endTitle?: string;
	titleClassName?: string;
	endTitleClassName?: string;
}) {
	return (
		<div
			className={
				'border-y border-skin-alt bg-skin-base text-base md:rounded-xl md:border' +
				(className ? ` ${className}` : '')
			}
		>
			{(title || endTitle) && (
				<div className="flex justify-between min-h-[4rem] border-b border-b-skin-alt px-4 md:px-6 fx">
					{title && (
						<div className={'text-lg font-bold' + (titleClassName ? ` ${titleClassName}` : '')}>
							{title}
						</div>
					)}
					{endTitle && (
						<div
							className={
								'text-base font-normal' + (endTitleClassName ? ` ${endTitleClassName}` : '')
							}
						>
							{endTitle}
						</div>
					)}
				</div>
			)}
			{loading ? (
				<div className="block px-4 py-4">
					<div className="lazy-loading mb-2 rounded-md w-4/5 h-5" />
					<div className="lazy-loading rounded-md w-1/2 h-5" />
				</div>
			) : (
				<div className={'leading-5 sm:leading-6' + (slim ? '' : ' p-4 md:p-6')}>{children}</div>
			)}
		</div>
	);
}
