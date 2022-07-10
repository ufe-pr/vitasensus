import { title } from 'process';
import React, { ReactNode } from 'react';

export function Block({
	loading,
	slim,
	children,
	className,
	title,
	titleClassName,
}: {
	loading?: boolean;
	slim?: boolean;
	children: ReactNode | ReactNode[];
	className?: string;
	title?: string;
	titleClassName?: string;
}) {
	return (
		<div
			className={
				'border-y border-skin-alt bg-skin-base text-base md:rounded-xl md:border' +
				(className ? ` ${className}` : '')
			}
		>
			{title && (
				<div
					className={
						'text-lg font-bold min-h-[4rem] border-b border-b-skin-alt px-4 md:px-6 fx' +
						(titleClassName ? ` ${titleClassName}` : '')
					}
				>
					{title}
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
