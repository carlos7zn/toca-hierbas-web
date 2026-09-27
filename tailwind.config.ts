import type { Config } from 'tailwindcss';

const config: Config = {
  darkMode: 'class',
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        background: {
          DEFAULT: '#050508',
          secondary: '#0a0a0f',
          tertiary: '#111118',
        },
        neon: {
          cyan: '#00f3ff',
          magenta: '#ff00e6',
          green: '#00ff88',
          yellow: '#fff000',
          orange: '#ff6600',
        },
        border: {
          DEFAULT: '#1a1a2e',
          neon: '#00f3ff33',
        },
        text: {
          primary: '#f0f0f5',
          secondary: '#a0a0b0',
          muted: '#606070',
        },
        surface: {
          DEFAULT: '#0d0d14',
          hover: '#14141e',
          glass: '#10101a80',
        },
      },
      fontFamily: {
        sans: ['var(--font-inter)', 'system-ui', 'sans-serif'],
        mono: ['var(--font-roboto-mono)', 'ui-monospace', 'monospace'],
        display: ['var(--font-space-grotesk)', 'system-ui', 'sans-serif'],
      },
      backdropBlur: {
        xs: '2px',
        '4xl': '72px',
      },
      boxShadow: {
        'neon-cyan': '0 0 20px #00f3ff40, 0 0 40px #00f3ff20',
        'neon-magenta': '0 0 20px #ff00e640, 0 0 40px #ff00e620',
        'neon-green': '0 0 20px #00ff8840, 0 0 40px #00ff8820',
        'glass': '0 8px 32px #00000080',
        'glass-inset': 'inset 0 1px 0 #ffffff10, inset 0 -1px 0 #00000040',
      },
      borderWidth: {
        'hairline': '0.5px',
      },
      animation: {
        'pulse-neon': 'pulse-neon 3s ease-in-out infinite',
        'float': 'float 6s ease-in-out infinite',
        'glitch': 'glitch 0.3s ease-in-out',
        'scanline': 'scanline 8s linear infinite',
        'shimmer': 'shimmer 2s ease-in-out infinite',
      },
      keyframes: {
        'pulse-neon': {
          '0%, 100%': { opacity: '0.5', transform: 'scale(1)' },
          '50%': { opacity: '1', transform: 'scale(1.02)' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        glitch: {
          '0%': { transform: 'translate(0)' },
          '20%': { transform: 'translate(-2px, 2px)' },
          '40%': { transform: 'translate(2px, -2px)' },
          '60%': { transform: 'translate(-2px, 0)' },
          '80%': { transform: 'translate(2px, 0)' },
          '100%': { transform: 'translate(0)' },
        },
        scanline: {
          '0%': { transform: 'translateY(-100%)' },
          '100%': { transform: 'translateY(100vh)' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'gradient-conic': 'conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))',
        'mesh-gradient': 'linear-gradient(135deg, #00f3ff10 0%, #ff00e610 50%, #00ff8810 100%)',
        'noise': "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numStitches='1' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E\")",
        'shimmer-gradient': 'linear-gradient(90deg, transparent, #ffffff10, transparent)',
      },
    },
  },
  plugins: [],
};

export default config;