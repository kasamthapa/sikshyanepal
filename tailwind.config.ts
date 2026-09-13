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
        display: ['var(--font-noto-serif)', 'var(--font-noto-devanagari)', 'Georgia', 'serif'],
        nepali:  ['var(--font-noto-devanagari)', 'system-ui', 'sans-serif'],
        sans:    ['var(--font-dm-sans)', 'var(--font-noto-devanagari)', 'system-ui', 'sans-serif'],
        mono:    ['var(--font-dm-mono)', 'Menlo', 'monospace'],
      },
      colors: {
        // ── Primary — deep confident blue ─────────────
        primary: {
          DEFAULT: '#1e429f',
          50:  '#eff3fb',
          100: '#dce5f5',
          200: '#bacce9',
          300: '#91add8',
          600: '#173782',
          700: '#122b66',
        },
        // ── Accent — warm orange (Nepal flag energy) ──
        accent: {
          DEFAULT: '#c93b37',
          50:  '#fff5f3',
          100: '#fee3df',
          200: '#fac5bd',
          600: '#ad2d2a',
        },
        // ── Dark sections ─────────────────────────────
        navy: '#16233f',
        // ── Surfaces & cards ─────────────────────────
        card:    '#ffffff',
        surface: '#ffffff',
        // ── Text ─────────────────────────────────────
        ink: {
          DEFAULT:   '#0f1629',
          secondary: '#374151',
          muted:     '#6b7280',
        },
        // ── Borders ──────────────────────────────────
        border: {
          DEFAULT: '#e6e4df',
          strong:  '#d4d1ca',
          subtle:  '#f3f1eb',
        },
        // ── Brand alias (backward compat) ────────────
        brand: {
          DEFAULT: '#1847c4',
          light:   '#3b82f6',
          glow:    '#1340b0',
          50:      '#eff3fe',
          100:     '#dde6fd',
        },
      },
      boxShadow: {
        'card':    '0 1px 3px 0 rgb(0 0 0 / 0.06), 0 1px 2px -1px rgb(0 0 0 / 0.04)',
        'card-md': '0 4px 6px -1px rgb(0 0 0 / 0.07), 0 2px 4px -2px rgb(0 0 0 / 0.05)',
        'card-lg': '0 10px 15px -3px rgb(0 0 0 / 0.08), 0 4px 6px -4px rgb(0 0 0 / 0.04)',
        'card-xl': '0 20px 25px -5px rgb(0 0 0 / 0.10), 0 8px 10px -6px rgb(0 0 0 / 0.04)',
      },
      animation: {
        'fade-in':    'fadeIn 0.2s ease-out',
        'slide-down': 'slideDown 0.2s ease-out',
      },
      keyframes: {
        fadeIn:    { '0%': { opacity: '0' },        '100%': { opacity: '1' } },
        slideDown: { '0%': { opacity: '0', transform: 'translateY(-8px)' }, '100%': { opacity: '1', transform: 'translateY(0)' } },
      },
    },
  },
  plugins: [],
}
export default config
