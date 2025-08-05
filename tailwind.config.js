// tailwind.config.js

/** @type {import('tailwindcss').Config} */

export default {
	content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
	theme: {
		extend: {
			colors: {
				// Neo-brutalist + movie theater palette
				concrete: {
					50: "#f8f9fa",
					100: "#e9ecef",
					200: "#dee2e6",
					300: "#ced4da",
					400: "#adb5bd",
					500: "#6c757d",
					600: "#495057",
					700: "#343a40",
					800: "#212529",
					900: "#1a1e21",
				},
				theater: {
					red: "#dc2626",
					gold: "#fbbf24",
					velvet: "#7c2d12",
				},
				street: {
					yellow: "#eab308",
					orange: "#ea580c",
					pink: "#ec4899",
				},
			},
			fontFamily: {
				brutal: ["Impact", "Arial Black", "sans-serif"],
				mono: ["JetBrains Mono", "Courier New", "monospace"],
			},
			boxShadow: {
				brutal: "8px 8px 0px 0px rgba(0,0,0,1)",
				"brutal-sm": "4px 4px 0px 0px rgba(0,0,0,1)",
			},
			borderWidth: {
				"3": "3px",
				"5": "5px",
			},
		},
	},
	plugins: [],
};
