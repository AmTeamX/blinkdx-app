// tailwind.config.js
/** @type {import('tailwindcss').Config} */
module.exports = {
    content: [
        './pages/**/*.{js,ts,jsx,tsx,mdx}',
        './components/**/*.{js,ts,jsx,tsx,mdx}',
        './app/**/*.{js,ts,jsx,tsx,mdx}', // If using App Router
        './src/**/*.{js,ts,jsx,tsx,mdx}', // If you have a src directory
    ],
    theme: {
        extend: {},
    },
    plugins: [],
}