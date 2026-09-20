/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,html}",
    "./components/**/*.{js,ts,jsx,tsx,html}",
    "./lib/**/*.{js,ts,jsx,tsx,html}",
    "./src/**/*.{js,ts,jsx,tsx,html}",
    "./js/**/*.{js,ts,jsx,tsx,html}",
    "./css/**/*.css",
    "./*.html"
  ],
  theme: {
    extend: {
      colors: {
        olive: {
          50: '#f6f8f5',
          100: '#e8ede4',
          200: '#d3decb',
          300: '#b4c7a6',
          400: '#8faa7c',
          500: '#6f8d59',
          600: '#567143',
          700: '#435835',
          800: '#38482d',
          900: '#2b3e2a',
          950: '#142013',
        },
        amberGold: '#f59e0b',
        darkSlate: '#0a1209',
        cardBg: '#1c2b1a',
        cardHighlight: '#243522',
        background: 'var(--background, #f8fafc)',
        foreground: 'var(--foreground, #0f172a)',
        card: {
          DEFAULT: 'var(--card, #ffffff)',
          foreground: 'var(--card-foreground, #0f172a)',
        },
        muted: {
          DEFAULT: 'var(--muted, #f1f5f9)',
          foreground: 'var(--muted-foreground, #64748b)',
        },
        border: 'var(--border, #cbd5e1)',
        input: 'var(--input, #cbd5e1)',
        primary: {
          DEFAULT: 'var(--primary, #0f172a)',
          foreground: 'var(--primary-foreground, #ffffff)',
        },
        secondary: {
          DEFAULT: 'var(--secondary, #f1f5f9)',
          foreground: 'var(--secondary-foreground, #0f172a)',
        },
        report: {
          company: 'var(--report-color-company-title, #1d4ed8)',
          title: 'var(--report-color-report-title, #0f172a)',
          sectionRevenue: 'var(--report-color-section-revenue, #1a629b)',
          sectionCogs: 'var(--report-color-section-cogs, #7a1c1c)',
          negative: 'var(--report-color-negative, #be123c)',
          negativeTotal: 'var(--report-color-negative-total, #9f1239)',
          positive: 'var(--report-color-positive, #065f46)',
          borderMaster: 'var(--report-border-master-color, #0f172a)',
        },
      },
      fontSize: {
        'report-company': ['1.125rem', { lineHeight: '1.5rem', fontWeight: '700' }],
        'report-title': ['1.25rem', { lineHeight: '1.75rem', fontWeight: '800' }],
        'report-meta': ['0.75rem', { lineHeight: '1rem', fontWeight: '500' }],
        'report-header': ['0.75rem', { lineHeight: '1rem', fontWeight: '700' }],
        'report-cell': ['0.75rem', { lineHeight: '1rem', fontWeight: '400' }],
        'report-total': ['0.8125rem', { lineHeight: '1.125rem', fontWeight: '700' }],
      },
      borderWidth: {
        'report-master': 'var(--report-border-master-width, 2px)',
      },
      fontFamily: {
        cairo: ['Cairo', 'sans-serif'],
        inter: ['Inter', 'sans-serif'],
        outfit: ['Outfit', 'sans-serif'],
      },
    },
  },
  plugins: [],
};
