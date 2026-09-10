/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      fontFamily: {
        sans: ['"Plus Jakarta Sans"', 'Inter', 'system-ui', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'monospace'],
        handwriting: ['Caveat', 'cursive'],
      },
      colors: {
        caramel: {
          50: '#fffaf3',
          100: '#fef3e4',
          200: '#fde4c4',
          300: '#face97',
          400: '#f7b267',
          500: '#F5BA72',
          600: '#e59d4c',
          700: '#ca7b33',
          800: '#a35e2b',
          900: '#844d27',
          950: '#1c1206',
        },
        warm: {
          950: '#0d0c0b',
          900: '#121110',
          850: '#161514',
          800: '#1d1b19',
          700: '#282522',
          600: '#383430',
        },
        coral: {
          400: '#ff8a75',
          500: '#ff735c',
          600: '#f05a42',
        },
      },
      animation: {
        'fade-in': 'fadeIn 0.25s ease-out',
        'slide-up': 'slideUp 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
        'bounce-subtle': 'bounceSubtle 0.4s cubic-bezier(0.16, 1, 0.3, 1)',
        'float': 'float 3s ease-in-out infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0', transform: 'scale(0.98)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
        slideUp: {
          '0%': { transform: 'translateY(16px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-6px)' },
        },
      },
      boxShadow: {
        'caramel-glow': '0 0 20px -3px rgba(245, 186, 114, 0.35)',
        'warm-glow': '0 0 35px -5px rgba(245, 186, 114, 0.18)',
        'emerald-glow': '0 0 20px -3px rgba(16, 185, 129, 0.4)',
        'rose-glow': '0 0 20px -3px rgba(225, 29, 72, 0.4)',
      },
    },
  },
  plugins: [],
}


