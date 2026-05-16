/** @type {import('tailwindcss').Config} */
export default {
  content: ['./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#F7FEE7',
          100: '#ECFCCB',
          200: '#D9F99D',
          300: '#BEF264',
          400: '#A3E635',
          500: '#84CC16',
          600: '#65A30D',
          700: '#4D7C0F',
          800: '#3F6212',
          900: '#365314',
        },
        grey: {
          0: '#FFFFFF',
          100: '#FAFAFA',
          200: '#F5F5F5',
          300: '#E5E5E5',
          400: '#D4D4D4',
          450: '#B6B6B6',
          500: '#949494',
          600: '#737373',
          700: '#525252',
          750: '#4A4A4A',
          800: '#404040',
          850: '#323232',
          900: '#262626',
          950: '#1E1E1E',
        },
      },
      fontFamily: {
        sans: [
          '-apple-system',
          'BlinkMacSystemFont',
          '"Segoe UI"',
          'Roboto',
          'Oxygen-Sans',
          'Ubuntu',
          'Cantarell',
          '"Helvetica Neue"',
          'sans-serif',
        ],
      },
      borderRadius: {
        'ic-sm': '10px',
        'ic-md': '16px',
        'ic-pill': '28px',
      },
      boxShadow: {
        'header': 'rgba(0,0,0,.05) 0 2px 7px',
        'overlay': 'rgba(17, 17, 26, 0.1) 0px 4px 16px, rgba(17, 17, 26, 0.1) 0px 8px 24px, rgba(17, 17, 26, 0.1) 0px 16px 56px',
      },
      maxWidth: {
        'ic-content': '1120px',
        'ic-header': '1170px',
        'ic-footer': '1100px',
      },
    },
  },
  plugins: [],
};
