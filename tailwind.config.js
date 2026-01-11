/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        // Primary brand colors - Modern vibrant blue
        primary: {
          DEFAULT: '#3B82F6',
          50: '#EFF6FF',
          100: '#DBEAFE',
          200: '#BFDBFE',
          300: '#93C5FD',
          400: '#60A5FA',
          500: '#3B82F6',
          600: '#2563EB',
          700: '#1D4ED8',
          800: '#1E40AF',
          900: '#1E3A8A',
          hover: '#60A5FA',
          pressed: '#2563EB',
        },
        // Secondary colors - Cyan accent
        secondary: {
          DEFAULT: '#06B6D4',
          50: '#ECFEFF',
          100: '#CFFAFE',
          200: '#A5F3FC',
          300: '#67E8F9',
          400: '#22D3EE',
          500: '#06B6D4',
          600: '#0891B2',
          hover: '#22D3EE',
          pressed: '#0891B2',
        },
        // CTA accent - Vibrant orange/amber
        accent: {
          DEFAULT: '#F59E0B',
          50: '#FFFBEB',
          100: '#FEF3C7',
          200: '#FDE68A',
          300: '#FCD34D',
          400: '#FBBF24',
          500: '#F59E0B',
          600: '#D97706',
          700: '#B45309',
          800: '#92400E',
          900: '#78350F',
          hover: '#FBBF24',
          pressed: '#D97706',
        },
        // Purple accent for special actions
        purple: {
          DEFAULT: '#8B5CF6',
          50: '#F5F3FF',
          100: '#EDE9FE',
          200: '#DDD6FE',
          300: '#C4B5FD',
          400: '#A78BFA',
          500: '#8B5CF6',
          600: '#7C3AED',
          hover: '#A78BFA',
          pressed: '#7C3AED',
        },
        // Light mode surfaces
        surface: {
          DEFAULT: '#FFFFFF',
          secondary: '#F8FAFC',
          tertiary: '#F1F5F9',
          elevated: '#FFFFFF',
        },
        // Dark mode surfaces - Modern dark with blue tint
        'surface-dark': {
          DEFAULT: '#0B1120',
          secondary: '#131B2E',
          tertiary: '#1E293B',
          elevated: '#1A2332',
          card: '#162032',
        },
        // Light mode text
        text: {
          primary: '#1E293B',
          secondary: '#475569',
          tertiary: '#64748B',
          disabled: '#94A3B8',
          inverse: '#F8FAFC',
        },
        // Dark mode text
        'text-dark': {
          primary: '#F1F5F9',
          secondary: '#CBD5E1',
          tertiary: '#94A3B8',
          disabled: '#64748B',
          inverse: '#1E293B',
        },
        // Borders
        border: {
          DEFAULT: '#E2E8F0',
          secondary: '#CBD5E1',
          focus: '#3B82F6',
        },
        'border-dark': {
          DEFAULT: '#1E293B',
          secondary: '#334155',
          focus: '#3B82F6',
          glow: 'rgba(59, 130, 246, 0.3)',
        },
        // Status colors
        success: {
          DEFAULT: '#10B981',
          light: '#D1FAE5',
          dark: '#065F46',
        },
        warning: {
          DEFAULT: '#F59E0B',
          light: '#FEF3C7',
          dark: '#92400E',
        },
        error: {
          DEFAULT: '#EF4444',
          light: '#FEE2E2',
          dark: '#991B1B',
        },
        info: {
          DEFAULT: '#3B82F6',
          light: '#DBEAFE',
          dark: '#1E40AF',
        },
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
      boxShadow: {
        'sm-light': '0 1px 2px 0 rgb(0 0 0 / 0.05)',
        'md-light': '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
        'lg-light': '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)',
        'sm-dark': '0 1px 2px 0 rgb(0 0 0 / 0.3)',
        'md-dark': '0 4px 6px -1px rgb(0 0 0 / 0.4), 0 2px 4px -2px rgb(0 0 0 / 0.3)',
        'lg-dark': '0 10px 15px -3px rgb(0 0 0 / 0.5), 0 4px 6px -4px rgb(0 0 0 / 0.4)',
        'inner-light': 'inset 0 2px 4px 0 rgb(0 0 0 / 0.05)',
        'inner-dark': 'inset 0 2px 4px 0 rgb(0 0 0 / 0.2)',
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
      borderRadius: {
        'sm': '4px',
        'md': '6px',
        'lg': '8px',
        'xl': '12px',
      },
      transitionDuration: {
        '150': '150ms',
        '200': '200ms',
        '300': '300ms',
      },
    },
  },
  plugins: [
    require('tailwindcss-animate'),
  ],
}
