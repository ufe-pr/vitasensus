import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
// @ts-ignore
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
// @ts-ignore
import { dark } from 'react-syntax-highlighter/dist/esm/styles/prism';

export const Markdown = ({ markdown }: { markdown: string }) => {
	return (
		<div className="leading-[1.7] text-lg">
			<ReactMarkdown
				className="prose dark:prose-invert"
				remarkPlugins={[remarkGfm]}
				components={{
					code({ node, inline, className, children, ...props }) {
						const match = /language-(\w+)/.exec(className || '');
						return !inline && match ? (
							<SyntaxHighlighter
								children={String(children).replace(/\n$/, '')}
								style={dark}
								language={match[1]}
								PreTag="div"
								{...props}
							/>
						) : (
							<code className={className} {...props}>
								{children}
							</code>
						);
					},
				}}
			>
				{markdown}
			</ReactMarkdown>
		</div>
	);
};
