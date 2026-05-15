import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['var(--font-inter)', 'system-ui', 'sans-serif'],
      },
      fontSize: {
        // Display sizes
        'display-2xl': ['4.5rem', { lineHeight: '1.1', letterSpacing: '-0.03em', fontWeight: '800' }],
        'display-xl':  ['3.75rem', { lineHeight: '1.1', letterSpacing: '-0.025em', fontWeight: '800' }],
        'display-lg':  ['3rem', { lineHeight: '1.15', letterSpacing: '-0.02em', fontWeight: '800' }],
        'display-md':  ['2.25rem', { lineHeight: '1.2', letterSpacing: '-0.02em', fontWeight: '700' }],
        'display-sm':  ['1.875rem', { lineHeight: '1.25', letterSpacing: '-0.015em', fontWeight: '700' }],
      },
      colors: {
        // Brand blues
        brand: {
          50:  '#eff6ff',
          100: '#dbeafe',
          200: '#bfdbfe',
          300: '#93c5fd',
          400: '#60a5fa',
          500: '#3b82f6',
          600: '#1a56db',
          700: '#1e429f',
          800: '#1e3a8a',
          900: '#1e3a8a',
          950: '#0f172a',
        },
        // Semantic surface colors
        surface: '#f8fafc',
        card:    '#ffffff',
        // Text hierarchy
        ink: {
          DEFAULT: '#0f172a',
          secondary: '#475569',
          muted: '#94a3b8',
          disabled: '#cbd5e1',
        },
        // Borders
        border: {
          DEFAULT: '#e2e8f0',
          strong: '#cbd5e1',
          subtle: '#f1f5f9',
        },
        // University accent colors
        tu:    { DEFAULT: '#1a56db', light: '#eff6ff', border: '#bfdbfe' },
        ku:    { DEFAULT: '#059669', light: '#f0fdf4', border: '#bbf7d0' },
        neb:   { DEFAULT: '#dc2626', light: '#fef2f2', border: '#fecaca' },
        ctevt: { DEFAULT: '#d97706', light: '#fffbeb', border: '#fde68a' },
        pu:    { DEFAULT: '#d97706', light: '#fffbeb', border: '#fde68a' },
        puru:  { DEFAULT: '#7c3aed', light: '#f5f3ff', border: '#ddd6fe' },
      },
      boxShadow: {
        'card':    '0 1px 3px 0 rgb(0 0 0 / 0.06), 0 1px 2px -1px rgb(0 0 0 / 0.04)',
        'card-md': '0 4px 6px -1px rgb(0 0 0 / 0.07), 0 2px 4px -2px rgb(0 0 0 / 0.05)',
        'card-lg': '0 10px 15px -3px rgb(0 0 0 / 0.08), 0 4px 6px -4px rgb(0 0 0 / 0.04)',
        'card-xl': '0 20px 25px -5px rgb(0 0 0 / 0.08), 0 8px 10px -6px rgb(0 0 0 / 0.04)',
        'glow-blue': '0 0 0 3px rgb(26 86 219 / 0.15)',
        'inner-sm': 'inset 0 1px 2px 0 rgb(0 0 0 / 0.05)',
      },
      backgroundImage: {
        'hero-grid': `radial-gradient(circle at 1px 1px, rgb(255 255 255 / 0.12) 1px, transparent 0)`,
        'dot-pattern': `radial-gradient(circle at 1px 1px, rgb(148 163 184 / 0.3) 1px, transparent 0)`,
      },
      backgroundSize: {
        'grid-32': '32px 32px',
        'dot-24':  '24px 24px',
      },
      animation: {
        'fade-in':      'fadeIn 0.2s ease-out',
        'slide-down':   'slideDown 0.2s ease-out',
        'slide-up':     'slideUp 0.2s ease-out',
      },
      keyframes: {
        fadeIn: {
          '0%':   { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideDown: {
          '0%':   { opacity: '0', transform: 'translateY(-8px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        slideUp: {
          '0%':   { opacity: '0', transform: 'translateY(8px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
      },
      transitionTimingFunction: {
        'smooth': 'cubic-bezier(0.4, 0, 0.2, 1)',
      },
    },
  },
  plugins: [],
}
export default config
