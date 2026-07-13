/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        primary: '#215E61',
        accent: '#FF9E20',
        ink: '#1D2128',
        page: '#F6F7FB',
        panel: '#FFFFFF',
        surface: '#F4F2F2',
        surfaceAlt: '#EEF2F7',
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
        panel: '0 18px 48px rgba(16, 24, 40, 0.06)',
        soft: '0 6px 16px rgba(29, 33, 40, 0.08)',
        inset: 'inset 0 1px 0 rgba(255,255,255,0.65)',
      },
      backgroundImage: {
        pageGlow: 'radial-gradient(circle at top left, rgba(255,158,32,0.12), transparent 24%), radial-gradient(circle at 85% 0%, rgba(33,94,97,0.10), transparent 26%), linear-gradient(180deg, #fbfcfe 0%, #f5f7fb 48%, #eef2f7 100%)',
        shell: 'linear-gradient(180deg, rgba(255,255,255,0.96) 0%, rgba(255,255,255,0.9) 100%)',
      },
    },
  },
  plugins: [],
};
