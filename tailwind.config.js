/** @type {import('tailwindcss').Config} */
export default {
	content: [
		"./index.html",
		"./src/**/*.{js,ts,jsx,tsx}",
	],
	theme: {
		extend: {
			colors: {
				'theater-red': '#dc2626',
				'theater-gold': '#fbbf24',
				'theater-velvet': '#7c2d12',
				'street-yellow': '#eab308',
				'street-orange': '#ea580c',
				'street-pink': '#ec4899',
				'concrete-50': '#f8f9fa',
				'concrete-100': '#e9ecef',
				'concrete-200': '#dee2e6',
				'concrete-300': '#ced4da',
				'concrete-400': '#adb5bd',
				'concrete-500': '#6c757d',
				'concrete-600': '#495057',
				'concrete-700': '#343a40',
				'concrete-800': '#212529',
				'concrete-900': '#1a1e21',
			},
			fontFamily: {
				'brutal': ['Impact', 'Arial Black', 'sans-serif'],
				'mono': ['JetBrains Mono', 'Courier New', 'monospace'],
			},
			boxShadow: {
				'brutal': '8px 8px 0px 0px rgba(0,0,0,1)',
				'brutal-sm': '4px 4px 0px 0px rgba(0,0,0,1)',
				'brutal-lg': '12px 12px 0px 0px rgba(0,0,0,1)',
			},
			borderWidth: {
				'3': '3px',
				'5': '5px',
			}
		},
	},
}