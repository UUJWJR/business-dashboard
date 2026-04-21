/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Enterprise Design System Colors (ppt-design-system.md)
        theme: {
          dark: '#00467F',
          DEFAULT: '#0070C0',
          light: '#D6E7F5',
          aux: '#418FDE',
        },
        neutral: {
          text: '#1A1A1A',
          secondary: '#595959',
          muted: '#8C8C8C',
          border: '#D9D9D9',
          bg: '#F5F6F8',
        },
        semantic: {
          green: '#0B6E31',
          'green-light': '#1AAB55',
          'green-bg': '#B7EB8F',
          red: '#820014',
          'red-light': '#CF1322',
          'red-bg': '#FFCCC7',
          orange: '#FA8C16',
        },
        chart: {
          1: '#0070C0',
          2: '#FA8C16',
          3: '#1AAB55',
          4: '#722ED1',
          5: '#13C2C2',
          6: '#EB2F96',
          7: '#A0522D',
          8: '#595959',
        },
        // Legacy aliases for backward compatibility
        primary: {
          50: '#f0f5ff',
          100: '#e0eaff',
          200: '#c2d5ff',
          300: '#94b5ff',
          400: '#5e8fff',
          500: '#3b6ef5',
          600: '#2554e8',
          700: '#1d43d4',
          800: '#1e39ab',
          900: '#1f3586',
        },
        success: {
          50: '#f0fdf4',
          500: '#22c55e',
          600: '#16a34a',
        },
        warning: {
          50: '#fffbeb',
          500: '#f59e0b',
          600: '#d97706',
        },
        danger: {
          50: '#fef2f2',
          500: '#ef4444',
          600: '#dc2626',
        },
        info: {
          50: '#eff6ff',
          500: '#3b82f6',
          600: '#2563eb',
        },
        surface: {
          0: '#ffffff',
          50: '#f8fafc',
          100: '#f1f5f9',
          200: '#e2e8f0',
          800: '#1e293b',
          900: '#0f172a',
          950: '#020617',
        }
      },
      boxShadow: {
        'card': '0 0 0 1px rgba(0, 0, 0, 0.03), 0 1px 2px 0 rgba(0, 0, 0, 0.04), 0 2px 8px rgba(0, 0, 0, 0.03)',
        'card-hover': '0 0 0 1px rgba(0, 0, 0, 0.03), 0 4px 12px -2px rgba(0, 0, 0, 0.06), 0 8px 24px -4px rgba(0, 0, 0, 0.04)',
        'card-dark': '0 0 0 1px rgba(255, 255, 255, 0.04), 0 1px 2px 0 rgba(0, 0, 0, 0.2), 0 2px 8px rgba(0, 0, 0, 0.15)',
        'card-dark-hover': '0 0 0 1px rgba(255, 255, 255, 0.06), 0 8px 24px -4px rgba(0, 0, 0, 0.4), 0 4px 12px -2px rgba(0, 0, 0, 0.2)',
        'float': '0 12px 40px -8px rgba(0, 0, 0, 0.12)',
        'float-dark': '0 12px 40px -8px rgba(0, 0, 0, 0.5)',
        'inner-glow': 'inset 0 1px 0 0 rgba(255, 255, 255, 0.1)',
      },
      borderRadius: {
        'card': '10px',
        'btn': '8px',
      },
      fontFamily: {
        sans: [
          '-apple-system',
          'BlinkMacSystemFont',
          '"Segoe UI"',
          'Roboto',
          '"Helvetica Neue"',
          'Arial',
          '"Noto Sans"',
          'sans-serif',
          '"Apple Color Emoji"',
          '"Segoe UI Emoji"',
          '"Segoe UI Symbol"',
          '"Noto Color Emoji"',
        ],
      },
    },
  },
  plugins: [],
}
