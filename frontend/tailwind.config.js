/** @type {import('tailwindcss').Config} */
export default {
    content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
    darkMode: 'class',
    theme: {
        extend: {
            fontFamily: {
                sans: ['Inter', 'SF Pro', 'system-ui', 'sans-serif'],
                mono: ['JetBrains Mono', 'Fira Code', 'Cascadia Code', 'monospace'],
            },
            colors: {
                background: {
                    primary: '#000000',
                    secondary: '#0a0a0a',
                    tertiary: '#171717',
                },
                accent: {
                    blue: '#3b82f6', // Keep for functional links/buttons but minimal
                    cyan: '#ffffff', // Usage in logos/icons -> White
                    purple: '#525252', // Muted for less distraction
                },
                status: {
                    success: '#10b981',
                    warning: '#f59e0b',
                    error: '#ef4444',
                },
                text: {
                    primary: '#ffffff',
                    secondary: '#a3a3a3',
                    tertiary: '#525252',
                },
            },
            boxShadow: {
                float: '0 0 0 1px rgba(255,255,255,0.08), 0 4px 20px rgba(0, 0, 0, 0.8)',
                'float-lg': '0 0 0 1px rgba(255,255,255,0.08), 0 8px 30px rgba(0, 0, 0, 0.9)',
                'inner-glow': 'inset 0 1px 0 rgba(255, 255, 255, 0.05)',
            },
            animation: {
                'slide-in-right': 'slideInRight 0.3s ease-out',
                'slide-out-right': 'slideOutRight 0.3s ease-in',
                'fade-in': 'fadeIn 0.2s ease-in',
                'pulse-subtle': 'pulseSubtle 2s ease-in-out infinite',
            },
            keyframes: {
                slideInRight: {
                    '0%': { transform: 'translateX(100%)', opacity: '0' },
                    '100%': { transform: 'translateX(0)', opacity: '1' },
                },
                slideOutRight: {
                    '0%': { transform: 'translateX(0)', opacity: '1' },
                    '100%': { transform: 'translateX(100%)', opacity: '0' },
                },
                fadeIn: {
                    '0%': { opacity: '0' },
                    '100%': { opacity: '1' },
                },
                pulseSubtle: {
                    '0%, 100%': { opacity: '1' },
                    '50%': { opacity: '0.7' },
                },
            },
        },
    },
    plugins: [],
};
