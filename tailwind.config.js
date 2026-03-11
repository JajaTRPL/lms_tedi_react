/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            colors: {
                'primary-teal': '#005a5a',
                'secondary-teal': '#008080',
                'bg-dark': '#002d2d',
            },
        },
    },
    plugins: [],
}
