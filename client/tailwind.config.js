/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        primary: '#215E61',
        accent: '#FF9E20',
        ink: '#1D2128',
        surface: '#F4F2F2',
        success: '#2E7D32',
        danger: '#C0392B',
        warning: '#F2B705',
        mist: '#E8ECFA',
        line: '#D8DDE8',
        muted: '#6B7280',
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
        monoPoints: ['"IBM Plex Mono"', '"SFMono-Regular"', 'monospace'],
      },
      spacing: {
        1: '4px',
        2: '8px',
        3: '12px',
        4: '16px',
        5: '20px',
        6: '24px',
        8: '32px',
        10: '40px',
        12: '48px',
      },
      borderRadius: {
        sm: '8px',
        DEFAULT: '12px',
        lg: '12px',
        xl: '16px',
        full: '9999px',
      },
      boxShadow: {
        panel: '0 4px 16px rgba(33, 94, 97, 0.06)',
        soft: '0 2px 8px rgba(29, 33, 40, 0.06)',
      },
      backgroundImage: {
        page: 'radial-gradient(circle at top left, rgba(255,158,32,0.16), transparent 24%), radial-gradient(circle at top right, rgba(33,94,97,0.12), transparent 28%), linear-gradient(180deg, #fbfbfe 0%, #f4f2f2 100%)',
      },
    },
  },
  plugins: [],
};
