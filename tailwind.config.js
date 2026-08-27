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
        navy: {
          DEFAULT: '#0A1628',
          mid:     '#0D1E38',
          deep:    '#060F1E',
        },
        gunmetal: {
          DEFAULT: '#1B2A4A',
          light:   '#243452',
          dark:    '#142038',
        },
        cyan: {
          DEFAULT: '#00D4FF',
          dim:     'rgba(0,212,255,0.12)',
          glow:    'rgba(0,212,255,0.25)',
        },
        'ui-white':  '#E8ECF1',
        'ui-muted':  '#9BAABB',
        'ui-faint':  '#4A6080',
        'ui-danger': '#FF4D6D',
        'ui-success':'#00E5A0',
      },
      fontFamily: {
        sans:    ['DM Sans', 'sans-serif'],
        display: ['Fraunces', 'serif'],
        mono:    ['JetBrains Mono', 'monospace'],
      },
      fontSize: {
        '10': '10px',
        '11': '11px',
      },
      backgroundImage: {
        'radial-cyan': 'radial-gradient(circle, rgba(0,212,255,0.12) 0%, rgba(0,212,255,0.04) 40%, transparent 70%)',
        'gradient-dark': 'linear-gradient(180deg, #0A1628 0%, #060F1E 100%)',
      },
      boxShadow: {
        'cyan-sm':  '0 0 12px rgba(0,212,255,0.2)',
        'cyan-md':  '0 0 24px rgba(0,212,255,0.3)',
        'cyan-lg':  '0 0 48px rgba(0,212,255,0.4)',
        'card':     '0 8px 32px rgba(0,0,0,0.4)',
        'card-lg':  '0 20px 60px rgba(0,0,0,0.5)',
      },
      animation: {
        'float-slow':  'float-drift 6s ease-in-out infinite',
        'pulse-glow':  'pulse-glow 4s ease-in-out infinite',
        'spin-ring':   'spin-ring 3s linear infinite',
        'stream-left': 'stream-left 8s linear infinite',
      },
      keyframes: {
        'float-drift': {
          '0%, 100%': { transform: 'translateY(0px)' },
          '33%':       { transform: 'translateY(-12px)' },
          '66%':       { transform: 'translateY(6px)' },
        },
      },
    },
  },
  plugins: [],
};