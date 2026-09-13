/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        emerald: {
          300: '#d9ed92',
          400: '#a3be8c',
          500: '#84a948',
          600: '#6b8e23',
          700: '#556b2f',
          800: '#3d4f1f',
          900: '#283618',
          950: '#141d0b',
        },
        olive: {
          300: '#d9ed92',
          400: '#a3be8c',
          500: '#84a948',
          600: '#6b8e23',
          700: '#556b2f',
          800: '#3d4f1f',
          900: '#283618',
          950: '#141d0b',
        },
        teal: {
          300: '#d0db97',
          400: '#99b83c',
          500: '#708238',
          900: '#21280b',
          950: '#131906',
        },
        dark: {
          800: '#1a2215',
          900: '#0e140d',
          950: '#070b07',
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'Consolas', 'monospace']
      }
    },
  },
  plugins: [],
}
