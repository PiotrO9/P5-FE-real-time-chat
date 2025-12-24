import type { Config } from 'tailwindcss';

export default <Partial<Config>>{
    darkMode: 'class',
    content: [
        './components/**/*.{js,vue,ts}',
        './layouts/**/*.vue',
        './pages/**/*.vue',
        './plugins/**/*.{js,ts}',
        './app.vue',
        './error.vue',
    ],
    theme: {
        extend: {
            colors: {
                primary: {
                    50: '#F0EFFE',
                    100: '#E1DFFD',
                    200: '#C3BFFB',
                    300: '#A59FF9',
                    400: '#877FF7',
                    500: '#615ED5',
                    600: '#4E4BAA',
                    700: '#3B387F',
                    800: '#282655',
                    900: '#14132A',
                    DEFAULT: '#615ED5',
                },
            },
        },
    },
    plugins: [],
};
