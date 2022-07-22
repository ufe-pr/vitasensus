module.exports = {
	content: ['./src/**/*.{js,jsx,ts,tsx}', '*.html'],
	darkMode: 'class',
	theme: {
		extend: {
			fontFamily: {
				// sans: ['arial', 'sans-serif'],
			},
			colors: {
				skin: {
					highlight: 'var(--highlight-color)',
					medlight: 'var(--medlight-color)',
					lowlight: 'var(--lowlight-color)',
					alt: 'var(--alt-color)',
					'bg-base': 'var(--bg-base-color)',
					'text-muted': 'var(--text-muted-color)',
				},
			},
			keyframes: {
				fadeIn: {
					'0%': { opacity: '0' },
					'100%': { opacity: '1' },
				},
			},
			animation: {
				'fade-in': 'fadeIn 1s',
				'pulse-fast': 'pulse 1.5s cubic-bezier(0.4, 0, 0.6, 1) infinite',
			},
			textColor: {
				skin: {
					primary: 'var(--text-primary-color)',
					secondary: 'var(--text-secondary-color)',
					muted: 'var(--text-muted-color)',
					// highlight: 'var(--highlight-color)',
				},
			},
			backgroundColor: {
				skin: {
					base: 'var(--bg-base-color)',
					middleground: 'var(--bg-middleground-color)',
					foreground: 'var(--bg-foreground-color)',
					'line-divider': 'var(--bg-line-divider-color)',
				},
			},
			borderColor: {
				skin: {
					foreground: 'var(--bg-foreground-color)',
					text: 'var(--text-primary-color)',
					'text-secondary': 'var(--text-secondary-color)',
				},
			},
		},
	},
	plugins: [require('@tailwindcss/typography')],
};
