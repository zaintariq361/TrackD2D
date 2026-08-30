import type { Config } from 'tailwindcss';

const config: Config = {
  darkMode: ['class'],
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        background: {
          DEFAULT: '#090909',
          surface: '#111111',
          elevated: '#1A1A1A',
          overlay: '#222222',
        },
        text: {
          primary: '#FFFFFF',
          secondary: '#A0A0A0',
          tertiary: '#666666',
        },
        accent: {
          DEFAULT: '#F5C518',
          foreground: '#090909',
          muted: 'rgba(245, 197, 24, 0.1)',
          hover: '#E6B800',
        },
        success: {
          DEFAULT: '#10B981',
          muted: 'rgba(16, 185, 129, 0.1)',
        },
        warning: {
          DEFAULT: '#F59E0B',
          muted: 'rgba(245, 158, 11, 0.1)',
        },
        danger: {
          DEFAULT: '#EF4444',
          muted: 'rgba(239, 68, 68, 0.1)',
        },
        info: {
          DEFAULT: '#3B82F6',
          muted: 'rgba(59, 130, 246, 0.1)',
        },
        border: {
          DEFAULT: '#2A2A2A',
          muted: '#1F1F1F',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      fontSize: {
        '2xs': ['0.625rem', { lineHeight: '0.875rem' }],
      },
      boxShadow: {
        premium: '0 0 0 1px rgba(245, 197, 24, 0.2), 0 8px 32px rgba(245, 197, 24, 0.08)',
        glow: '0 0 20px rgba(245, 197, 24, 0.3)',
        card: '0 4px 24px rgba(0, 0, 0, 0.4)',
        dropdown: '0 8px 32px rgba(0, 0, 0, 0.6)',
      },
      animation: {
        'fade-in': 'fadeIn 0.3s ease-in-out',
        'slide-up': 'slideUp 0.3s ease-out',
        shimmer: 'shimmer 2s infinite',
        'pulse-glow': 'pulseGlow 2s ease-in-out infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(8px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
        pulseGlow: {
          '0%, 100%': { boxShadow: '0 0 10px rgba(245, 197, 24, 0.2)' },
          '50%': { boxShadow: '0 0 20px rgba(245, 197, 24, 0.4)' },
        },
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'gradient-gold': 'linear-gradient(135deg, #F5C518 0%, #E6B800 100%)',
        'gradient-dark': 'linear-gradient(135deg, #111111 0%, #1A1A1A 100%)',
      },
    },
  },
  plugins: [require('tailwindcss-animate')],
};

export default config;
