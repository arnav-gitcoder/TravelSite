/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        sans:    ['"Inter"', '"Plus Jakarta Sans"', 'system-ui', 'sans-serif'],
        display: ['"Poppins"', '"Outfit"', 'system-ui', 'sans-serif'],
      },
      colors: {
        primary: {
          50:  '#eff6ff', 100: '#dbeafe', 200: '#bfdbfe',
          300: '#93c5fd', 400: '#60a5fa', 500: '#3b82f6',
          600: '#2563eb', 700: '#1d4ed8', 800: '#1e40af',
          900: '#1e3a8a', 950: '#172554',
        },
        gold: {
          50:  '#fffbeb', 100: '#fef3c7', 200: '#fde68a',
          300: '#fcd34d', 400: '#fbbf24', 500: '#f59e0b',
          600: '#e8a838', 700: '#d97706', 800: '#b45309', 900: '#92400e',
        },
        navy: {
          50:  '#f0f4ff', 100: '#e0e8ff', 200: '#c7d4fd',
          300: '#a5b4fb', 400: '#818cf8', 500: '#3b50cc',
          600: '#1a3fa0', 700: '#142e80', 800: '#0f2060',
          900: '#0a1540', 950: '#050f2e',
        },
        surface: {
          50:  '#f9fafb', 100: '#f3f4f6', 150: '#eceef2',
          200: '#e5e7eb', 250: '#d8dbe1', 300: '#d1d5db',
          400: '#9ca3af', 500: '#6b7280', 600: '#4b5563',
          700: '#374151', 800: '#1f2937', 900: '#111827', 950: '#030712',
        },
        accent: {
          50: '#fff1f2', 100: '#ffe4e6', 200: '#fecdd3',
          300: '#fda4af', 400: '#fb7185', 500: '#f43f5e',
          600: '#e11d48', 700: '#be123c', 800: '#9f1239', 900: '#881337',
        },
      },
      borderRadius: { '4xl': '2rem', '5xl': '2.5rem' },
      boxShadow: {
        card:        '0 1px 3px rgba(0,0,0,0.04), 0 8px 24px rgba(0,0,0,0.06)',
        'card-hover':'0 4px 12px rgba(0,0,0,0.06), 0 24px 48px rgba(0,0,0,0.10)',
        glass:       '0 8px 32px rgba(0,0,0,0.07)',
        gold:        '0 4px 20px rgba(232,168,56,0.35)',
        navy:        '0 4px 20px rgba(30,58,138,0.22)',
        glow:        '0 0 40px rgba(37,99,235,0.18)',
      },
      keyframes: {
        'fade-in-up':     { '0%': { opacity:'0', transform:'translateY(20px)' }, '100%': { opacity:'1', transform:'translateY(0)' } },
        'fade-in':        { '0%': { opacity:'0' }, '100%': { opacity:'1' } },
        'scale-in':       { '0%': { opacity:'0', transform:'scale(0.94)' }, '100%': { opacity:'1', transform:'scale(1)' } },
        float:            { '0%,100%': { transform:'translateY(0)' }, '50%': { transform:'translateY(-10px)' } },
        'pulse-soft':     { '0%,100%': { opacity:'1' }, '50%': { opacity:'0.65' } },
        shimmer:          { '0%': { backgroundPosition:'-200% 0' }, '100%': { backgroundPosition:'200% 0' } },
        'slide-in-right': { '0%': { opacity:'0', transform:'translateX(20px)' }, '100%': { opacity:'1', transform:'translateX(0)' } },
      },
      animation: {
        'fade-in-up':     'fade-in-up 0.5s ease-out forwards',
        'fade-in':        'fade-in 0.4s ease-out forwards',
        'scale-in':       'scale-in 0.35s ease forwards',
        float:            'float 5s ease-in-out infinite',
        'pulse-soft':     'pulse-soft 2.5s ease-in-out infinite',
        shimmer:          'shimmer 2s linear infinite',
        'slide-in-right': 'slide-in-right 0.5s ease-out forwards',
      },
    },
  },
  plugins: [],
};