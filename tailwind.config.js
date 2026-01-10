/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#0078D4',
          hover: '#106EBE',
          pressed: '#005A9E',
        },
        surface: {
          DEFAULT: '#FFFFFF',
          secondary: '#F3F2F1',
          tertiary: '#EDEBE9',
        },
        text: {
          primary: '#323130',
          secondary: '#605E5C',
          disabled: '#A19F9D',
        },
        success: '#107C10',
        warning: '#FFB900',
        error: '#D83B01',
        info: '#0078D4',
      },
      fontFamily: {
        sans: ['"Segoe UI"', 'system-ui', 'sans-serif'],
      },
      fontSize: {
        heading: ['20px', { lineHeight: '28px', fontWeight: '600' }],
        subheading: ['14px', { lineHeight: '20px', fontWeight: '600' }],
        body: ['13px', { lineHeight: '18px', fontWeight: '400' }],
        caption: ['12px', { lineHeight: '16px', fontWeight: '400' }],
      },
      animation: {
        'fade-in': 'fadeIn 0.2s ease-out',
        'slide-up': 'slideUp 0.3s ease-out',
        'pulse-soft': 'pulseSoft 2s ease-in-out infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        pulseSoft: {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.7' },
        },
      },
    },
  },
  plugins: [
    require('tailwindcss-animate'),
  ],
}
