/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        // ── Brand ──────────────────────────────
        brand: {
          orange:        '#E8622A',
          'orange-hover':'#D05420',
          'orange-light':'#F47B3A',
          'orange-pale': '#FFF1E7',
          'orange-border':'#FDCFB3',
          charcoal:      '#1E293B',
          'charcoal-2':  '#475569',
          'charcoal-3':  '#64748B',
          bg:            '#EEF2F6',
          'bg-2':        '#E2E8F0',
          'bg-card':     '#FFFFFF',
          'bg-elevated': '#F1F5F9',
          white:         '#FFFFFF',
          surface:       '#F8FAFC',
          border:        '#CBD5E1',
          'border-2':    '#94A3B8',
        },
        // ── Status ─────────────────────────────
        status: {
          'submit-bg':     '#ECFDF5',
          'submit-text':   '#047857',
          'submit-border': '#A7F3D0',
          'review-bg':     '#FFFBEB',
          'review-text':   '#B45309',
          'review-border': '#FDE68A',
          'reject-bg':     '#FEF2F2',
          'reject-text':   '#B91C1C',
          'reject-border': '#FECACA',
        },
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
      },
      boxShadow: {
        '2xs':  '0 1px 2px rgba(0,0,0,0.03)',
        xs:     '0 1px 2px rgba(0,0,0,0.04)',
        sm:     '0 1px 2px rgba(0,0,0,0.05)',
        card:   '0 1px 3px rgba(0,0,0,0.06), 0 1px 2px rgba(0,0,0,0.04)',
        md:     '0 4px 6px -1px rgba(0,0,0,0.06), 0 2px 4px -1px rgba(0,0,0,0.04)',
        lg:     '0 10px 25px -3px rgba(0,0,0,0.08), 0 4px 6px -2px rgba(0,0,0,0.03)',
        xl:     '0 20px 35px -5px rgba(0,0,0,0.1), 0 10px 10px -5px rgba(0,0,0,0.04)',
        orange: '0 4px 14px rgba(232,98,42,0.3)',
        'orange-lg': '0 10px 25px -3px rgba(232,98,42,0.35)',
        'orange-glow': '0 0 30px -5px rgba(232,98,42,0.35)',
        glow:   '0 0 20px rgba(232,98,42,0.2)',
      },
      borderRadius: {
        lg:  '10px',
        xl:  '12px',
        '2xl': '16px',
        '3xl': '24px',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-6px)' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
        pulseSlow: {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.6' },
        },
        scanline: {
          '0%': { transform: 'translateY(-100%)' },
          '100%': { transform: 'translateY(100%)' },
        },
      },
      animation: {
        float: 'float 4s ease-in-out infinite',
        'pulse-slow': 'pulseSlow 3s ease-in-out infinite',
        shimmer: 'shimmer 2.5s linear infinite',
        scan: 'scanline 2s linear infinite',
      },
    },
  },
  plugins: [
    require('@tailwindcss/typography'),
    require('@tailwindcss/forms'),
  ],
};
