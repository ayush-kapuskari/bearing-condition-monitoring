/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        dark: {
          bg: '#111116',
          card: '#202027',
          sidebar: '#191920',
          border: '#353540',
          hover: '#282833',
        },
        brand: {
          purple: '#A100FF',
          magenta: '#E000A8',
          cyan: '#22D3EE',
        },
        content: {
          primary: '#F5F5FA',
          secondary: '#A5A5B5',
          muted: '#6E6E82',
        },
        status: {
          healthy: '#4ADE80',
          uncertain: '#FBBF24',
          fault: '#FB7185',
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'BlinkMacSystemFont', '"Segoe UI"', 'Roboto', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'ui-monospace', 'SFMono-Regular', 'Menlo', 'Monaco', 'Consolas', 'monospace'],
      },
      boxShadow: {
        'neon-purple': '0 0 20px -3px rgba(161, 0, 255, 0.35)',
        'neon-magenta': '0 0 20px -3px rgba(224, 0, 168, 0.35)',
        'neon-cyan': '0 0 20px -3px rgba(34, 211, 238, 0.35)',
        'subtle-glow': '0 0 15px rgba(161, 0, 255, 0.15)',
      }
    },
  },
  plugins: [],
}

